export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function p4(n: number): string {
  return ('0000' + n).slice(-4)
}

export function p2(n: number): string {
  return n < 10 ? '0' + n : '' + n
}

export function today(): string {
  const d = new Date()
  return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear()
}

export function todayISO(): string {
  const d = new Date()
  return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate())
}

export function $p(n: number): string {
  return '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function stk(q: number, m: number): 'k' | 'w' | 'e' {
  return q <= 0 ? 'e' : q < m ? 'w' : 'k'
}

export function stlbl(s: 'k' | 'w' | 'e'): string {
  return s === 'k' ? 'OK' : s === 'w' ? 'Bajo' : 'Faltante'
}

export function daysUntil(iso: string): number {
  if (!iso) return 9999
  const d = new Date(iso)
  const n = new Date()
  n.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - n.getTime()) / 864e5)
}

export function d2i(s: string): string {
  if (!s || s.indexOf('-') >= 0) return s || ''
  const p = s.split('/')
  return p[2] + '-' + p[1] + '-' + p[0]
}

export function i2d(s: string): string {
  if (!s || s.indexOf('/') >= 0) return s || today()
  const p = s.split('-')
  return p[2] + '/' + p[1] + '/' + p[0]
}

export function mkSalt(): string {
  let s = ''
  for (let i = 0; i < 16; i++) s += ('0' + Math.floor(Math.random() * 256).toString(16)).slice(-2)
  return s
}

export function lsGet<T>(k: string, fb: T): T {
  try {
    const v = localStorage.getItem(k)
    return v !== null ? JSON.parse(v) : fb
  } catch {
    return fb
  }
}

export function lsSet(k: string, v: unknown): void {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {}
}

export function totalR(r: { its?: Array<{ q?: number; cantidad?: number; pr?: number; precio?: number }> }): number {
  return (r.its || []).reduce((a, i) => {
    const q = +(i.q ?? i.cantidad ?? 0)
    const p = +(i.pr ?? i.precio ?? 0)
    return a + q * p
  }, 0)
}

export function csvExport(name: string, rows: (string | number)[][]): void {
  const c = rows
    .map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(','))
    .join('\r\n')
  const bl = new Blob(['\uFEFF' + c], { type: 'text/csv;charset=utf-8;' })
  const u = URL.createObjectURL(bl)
  const a = document.createElement('a')
  a.href = u
  a.download = name
  a.click()
  URL.revokeObjectURL(u)
}

export function sha256(msg: string): string {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ]
  const u = (x: number) => x >>> 0
  const r = (x: number, n: number) => u((x >>> n) | (x << (32 - n)))
  const a = (...args: number[]) => args.reduce((s, x) => u(s + x), 0)
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]
  const b: number[] = []
  for (let i = 0; i < msg.length; i++) {
    const c = msg.charCodeAt(i)
    if (c < 128) b.push(c)
    else if (c < 2048) b.push(192 | (c >> 6), 128 | (c & 63))
    else b.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63))
  }
  const bl2 = b.length * 8
  b.push(0x80)
  while (b.length % 64 !== 56) b.push(0)
  b.push(0, 0, 0, 0, (bl2 >>> 24) & 0xff, (bl2 >>> 16) & 0xff, (bl2 >>> 8) & 0xff, bl2 & 0xff)
  for (let ck = 0; ck < b.length; ck += 64) {
    const w: number[] = []
    for (let i = 0; i < 16; i++) w[i] = u((b[ck + i * 4] << 24) | (b[ck + i * 4 + 1] << 16) | (b[ck + i * 4 + 2] << 8) | b[ck + i * 4 + 3])
    for (let i = 16; i < 64; i++) {
      const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3)
      const s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10)
      w[i] = a(w[i - 16], s0, w[i - 7], s1)
    }
    let av = H[0], bv = H[1], cv = H[2], dv = H[3], ev = H[4], fv = H[5], gv = H[6], hv = H[7]
    for (let i = 0; i < 64; i++) {
      const S1 = r(ev, 6) ^ r(ev, 11) ^ r(ev, 25)
      const ch = (ev & fv) ^ (~ev & gv)
      const t1 = a(hv, S1, ch, K[i], w[i])
      const S0 = r(av, 2) ^ r(av, 13) ^ r(av, 22)
      const mj = (av & bv) ^ (av & cv) ^ (bv & cv)
      const t2 = a(S0, mj)
      hv = gv; gv = fv; fv = ev; ev = a(dv, t1); dv = cv; cv = bv; bv = av; av = a(t1, t2)
    }
    H[0] = a(H[0], av); H[1] = a(H[1], bv); H[2] = a(H[2], cv); H[3] = a(H[3], dv)
    H[4] = a(H[4], ev); H[5] = a(H[5], fv); H[6] = a(H[6], gv); H[7] = a(H[7], hv)
  }
  return H.map(h => ('00000000' + h.toString(16)).slice(-8)).join('')
}
