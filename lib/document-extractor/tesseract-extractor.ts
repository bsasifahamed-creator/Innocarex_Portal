import path from "path";
import { createWorker } from "tesseract.js";

const projectRoot = process.cwd();

// Use local assets only to avoid hanging on CDN downloads.
const workerPath = path.join(projectRoot, "node_modules/tesseract.js/src/worker-script/node/index.js");
const langPath = projectRoot; // contains `eng.traineddata` at repo root
const corePath = path.join(projectRoot, "node_modules/tesseract.js-core");
const dataPath = path.join(projectRoot, ".tessdata");
const cachePath = path.join(projectRoot, ".tesscache");

const OCR_TIMEOUT_MS = 30000;

let workerSingleton: any | null = null;
let workerInitPromise: Promise<any> | null = null;

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`OCR timeout after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function getWorker() {
  if (workerSingleton) return workerSingleton;
  if (!workerInitPromise) {
    workerInitPromise = createWorker("eng", 0, {
      logger: () => {},
      errorHandler: () => {},
      workerPath,
      langPath,
      corePath,
      dataPath,
      cachePath,
      cacheMethod: "none",
      gzip: false,
    }).then(async (w) => {
      workerSingleton = w;
      return w;
    });
  }

  workerSingleton = await workerInitPromise;
  return workerSingleton;
}

export async function extractTextFromImage(imageBuffer: Buffer, mimeType: string): Promise<string> {
  let worker: any;
  try {
    const start = Date.now();
    worker = await withTimeout(getWorker(), OCR_TIMEOUT_MS);

    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const recognizeResult: any = await withTimeout(worker.recognize(dataUrl), OCR_TIMEOUT_MS);
    const text = recognizeResult?.data?.text ?? "";
    if (process.env.NODE_ENV === "development") {
      console.log(`[tesseract] OCR duration ms: ${Date.now() - start}; text length: ${text.length}`);
    }
    return text;
  } catch {
    // Reset singleton to recover from stuck worker initialization.
    workerSingleton = null;
    workerInitPromise = null;
    try {
      if (worker) await worker.terminate();
    } catch {
      // ignore
    }
    if (process.env.NODE_ENV === "development") {
      console.log("[tesseract] OCR failed (timeout or worker error).");
    }
    return "";
  }
}

