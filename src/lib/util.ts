/** Enlaces a apps de mapas. Amap (高德) es la app que funciona bien en China. */

export function amapLink(lat?: number, lng?: number, name?: string, nameZh?: string): string | null {
  const label = nameZh || name
  if (lat !== undefined && lng !== undefined) {
    const q = label ? `&name=${encodeURIComponent(label)}` : ''
    return `https://uri.amap.com/marker?position=${lng},${lat}${q}&src=chinatrip&coordinate=gaode&callnative=1`
  }
  if (label) {
    return `https://uri.amap.com/search?keyword=${encodeURIComponent(label)}&src=chinatrip&callnative=1`
  }
  return null
}

export function amapSearch(keyword: string): string {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(keyword)}&src=chinatrip&callnative=1`
}

export function appleMapsLink(lat?: number, lng?: number, name?: string): string | null {
  if (lat !== undefined && lng !== undefined) {
    const q = name ? `&q=${encodeURIComponent(name)}` : ''
    return `https://maps.apple.com/?ll=${lat},${lng}${q}`
  }
  if (name) return `https://maps.apple.com/?q=${encodeURIComponent(name)}`
  return null
}

export function googleMapsLink(lat?: number, lng?: number, name?: string): string | null {
  if (lat !== undefined && lng !== undefined) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  if (name) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
  return null
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

export function speakChinese(text: string) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return false
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    const voices = synth.getVoices()
    const zh = voices.find((v) => v.lang.startsWith('zh'))
    if (zh) utterance.voice = zh
    synth.speak(utterance)
    return true
  } catch {
    return false
  }
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  )
}

export function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}
