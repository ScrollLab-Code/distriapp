import { lsGet, lsSet, mkSalt, sha256 } from '../lib/utils'

export function sessOk(): boolean {
  if (sessionStorage.getItem('ok') !== '1') return false
  if (Date.now() - Number(sessionStorage.getItem('ts') || 0) > 8 * 3600000) {
    sessionStorage.clear()
    return false
  }
  return true
}

export function sessSet(): void {
  sessionStorage.setItem('ok', '1')
  sessionStorage.setItem('ts', '' + Date.now())
}

export function lock(): void {
  sessionStorage.clear()
  location.reload()
}

export function passOk(p: string): boolean {
  const a = lsGet<{ h: string; s: string } | null>('_a', null)
  return !!(a && a.h && a.s && sha256(a.s + p) === a.h)
}

export function setupPass(p: string): void {
  const s = mkSalt()
  lsSet('_a', { h: sha256(s + p), s })
}

export function hasPass(): boolean {
  return !!lsGet('_a', null)
}
