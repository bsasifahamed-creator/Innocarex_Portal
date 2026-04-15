export async function extractFromPDF(buffer: Buffer): Promise<{ text: string; isScanned: boolean }> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = (result?.text || "").trim();
    await parser.destroy();
    const isScanned = text.length < 100;
    return { text, isScanned };
  } catch {
    return { text: "", isScanned: true };
  }
}

export async function renderPdfPagesAsPngBuffers(buffer: Buffer, maxPages: number = 2): Promise<Buffer[]> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getScreenshot({
      first: Math.max(1, maxPages),
      imageBuffer: true,
      imageDataUrl: false,
      scale: 2,
    });
    await parser.destroy();
    const pages = Array.isArray(result?.pages) ? result.pages : [];
    return pages
      .map((p) => p?.data)
      .filter((d): d is Uint8Array => d instanceof Uint8Array)
      .map((d) => Buffer.from(d));
  } catch {
    return [];
  }
}

