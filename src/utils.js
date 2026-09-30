import { CURRENCY } from './data'

export function averageRating(reviews) {
  if (!reviews.length) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

export function ratingBreakdown(reviews) {
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))
}

export function formatPrice(amount) {
  return `${CURRENCY}${amount.toLocaleString()}`
}

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function startingPrice(vendor) {
  return Math.min(...vendor.services.map((s) => s.price))
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
