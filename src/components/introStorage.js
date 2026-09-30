const SEEN_KEY = 'wc-intro-seen'

// Plays once per browser session. Add ?intro to the URL to replay it.
export function shouldPlayIntro() {
  if (new URLSearchParams(window.location.search).has('intro')) return true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return !sessionStorage.getItem(SEEN_KEY)
  } catch {
    return true
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // storage unavailable (private mode) — the intro will simply play again
  }
}
