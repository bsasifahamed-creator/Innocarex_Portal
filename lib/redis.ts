import Redis from 'ioredis'

let _client: Redis | null = null

function getClient(): Redis {
  if (_client) return _client
  if (!process.env.REDIS_URL) {
    console.warn('[redis] REDIS_URL not set — using in-memory fallback')
    return memoryFallback() as unknown as Redis
  }
  _client = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true })
  _client.on('error', e => console.error('[redis]', e.message))
  return _client
}

export const redis = getClient()

export async function checkDuplicate(emiratesId: string, tierId: string) {
  try {
    const existing = await redis.get(`dup:${emiratesId}:${tierId}`)
    return { isDuplicate: !!existing, existingRef: existing }
  } catch { return { isDuplicate: false, existingRef: null } }
}

export async function setDuplicateGuard(emiratesId: string, tierId: string, ref: string) {
  try { await redis.set(`dup:${emiratesId}:${tierId}`, ref, 'EX', 300) }
  catch (e) { console.error('[redis] setDuplicateGuard:', e) }
}

export async function clearDuplicateGuard(emiratesId: string, tierId: string) {
  try { await redis.del(`dup:${emiratesId}:${tierId}`) }
  catch (e) { console.error('[redis] clearDuplicateGuard:', e) }
}

function memoryFallback() {
  const store = new Map<string, { v: string; exp: number }>()
  const alive = (k: string) => {
    const e = store.get(k)
    if (!e) return null
    if (e.exp < Date.now()) { store.delete(k); return null }
    return e.v
  }
  return {
    get:    async (k: string) => alive(k),
    set:    async (k: string, v: string, _ex?: string, ttl?: number) => {
      store.set(k, { v, exp: ttl ? Date.now() + ttl * 1000 : Infinity }); return 'OK'
    },
    del:    async (k: string) => { store.delete(k); return 1 },
    incr:   async (k: string) => {
      const n = parseInt(alive(k) ?? '0') + 1
      store.set(k, { v: String(n), exp: Infinity }); return n
    },
    expire: async () => 1,
    on: () => {},
  }
}
