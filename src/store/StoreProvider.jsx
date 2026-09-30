import { useEffect, useMemo, useState } from 'react'
import { vendors as initialVendors, communityThreads, sampleBookingRequests } from '../data'
import { StoreContext } from './context'

// Front-end only state. Changes are kept in localStorage so the demo feels
// real between page reloads; replace with API calls when a backend exists.
const STORAGE_KEY = 'wedconnect-state-v1'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.vendors) return saved
  } catch {
    // Storage unavailable or corrupted — fall back to the static data.
  }
  return {
    vendors: initialVendors,
    bookings: sampleBookingRequests,
    threads: communityThreads,
    favorites: [],
    user: null,
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore — the app still works without persistence.
    }
  }, [state])

  const actions = useMemo(() => {
    const updateVendor = (id, change) =>
      setState((s) => ({
        ...s,
        vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...change(v) } : v)),
      }))

    return {
      setAvailability: (id, available, unavailableNote = '') =>
        updateVendor(id, () => ({ available, unavailableNote })),
      blockDate: (id, date) =>
        updateVendor(id, (v) => ({ bookedDates: [...new Set([...v.bookedDates, date])].sort() })),
      unblockDate: (id, date) =>
        updateVendor(id, (v) => ({ bookedDates: v.bookedDates.filter((d) => d !== date) })),
      addReview: (id, review) => updateVendor(id, (v) => ({ reviews: [review, ...v.reviews] })),
      replyToReview: (id, index, reply) =>
        updateVendor(id, (v) => ({ reviews: v.reviews.map((r, i) => (i === index ? { ...r, reply } : r)) })),
      addBooking: (booking) => setState((s) => ({ ...s, bookings: [booking, ...s.bookings] })),
      setBookingStatus: (bookingId, status) =>
        setState((s) => {
          const booking = s.bookings.find((b) => b.id === bookingId)
          const bookings = s.bookings.map((b) => (b.id === bookingId ? { ...b, status } : b))
          // Confirming a booking automatically blocks that date on the vendor's calendar.
          const vendors =
            status === 'confirmed' && booking
              ? s.vendors.map((v) =>
                  v.id === booking.vendorId
                    ? { ...v, bookedDates: [...new Set([...v.bookedDates, booking.date])].sort() }
                    : v,
                )
              : s.vendors
          return { ...s, bookings, vendors }
        }),
      toggleFavorite: (id) =>
        setState((s) => ({
          ...s,
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
        })),
      addThread: (thread) => setState((s) => ({ ...s, threads: [thread, ...s.threads] })),
      addReply: (threadId, reply) =>
        setState((s) => ({
          ...s,
          threads: s.threads.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, reply] } : t)),
        })),
      likeThread: (threadId) =>
        setState((s) => ({
          ...s,
          threads: s.threads.map((t) => (t.id === threadId ? { ...t, likes: t.likes + 1 } : t)),
        })),
      setUser: (user) => setState((s) => ({ ...s, user })),
      resetDemo: () => {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
        setState({
          vendors: initialVendors,
          bookings: sampleBookingRequests,
          threads: communityThreads,
          favorites: [],
          user: null,
        })
      },
    }
  }, [])

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
