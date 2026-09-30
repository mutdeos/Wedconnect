import { useState } from 'react'
import { Link } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { vendorDashboardStats } from '../data'
import { useStore } from '../store/context'
import { averageRating, formatDate, todayISO } from '../utils'

// Demo dashboard: pick which vendor you are "logged in" as.
export default function Dashboard() {
  const { vendors, bookings, setAvailability, blockDate, unblockDate, setBookingStatus, replyToReview } = useStore()
  const [vendorId, setVendorId] = useState(vendors[0].id)
  const [newDate, setNewDate] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const vendor = vendors.find((v) => v.id === vendorId)
  const [note, setNote] = useState(vendor.unavailableNote ?? '')

  const requests = bookings.filter((b) => b.vendorId === vendor.id)
  const pending = requests.filter((b) => b.status === 'pending')
  const rating = averageRating(vendor.reviews)
  const unanswered = vendor.reviews.map((r, i) => ({ ...r, index: i })).filter((r) => !r.reply)
  const upcomingDates = vendor.bookedDates.filter((d) => d >= todayISO())

  const switchVendor = (id) => {
    setVendorId(id)
    setNote(vendors.find((v) => v.id === id).unavailableNote ?? '')
  }

  return (
    <div className="container page">
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Vendor dashboard</p>
          <h1>{vendor.name}</h1>
          <Link to={`/vendors/${vendor.id}`}>View public profile →</Link>
        </div>
        <label className="inline demo-switch">
          <span className="muted small">Demo: viewing as</span>
          <select value={vendorId} onChange={(e) => switchVendor(e.target.value)}>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="stats-grid dashboard-stats">
        <div className="stat card">
          <strong>
            {rating.toFixed(1)} <StarRating value={rating} size="sm" />
          </strong>
          <span>{vendor.reviews.length} reviews</span>
        </div>
        {vendorDashboardStats.slice(0, 3).map((s) => (
          <div key={s.label} className="stat card">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Availability</h2>
          <div className={vendor.available ? 'availability-toggle on' : 'availability-toggle off'}>
            <div>
              <strong>{vendor.available ? 'You are taking bookings' : 'You are marked as unavailable'}</strong>
              <p className="muted small">
                {vendor.available
                  ? 'Couples can send you booking requests for any date you have not blocked.'
                  : 'Your profile stays visible, but couples cannot send booking requests.'}
              </p>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={vendor.available}
              onClick={() => setAvailability(vendor.id, !vendor.available, note)}
            >
              <span />
            </button>
          </div>
          {!vendor.available && (
            <label>
              <span>Message shown to couples</span>
              <div className="input-with-button">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Fully booked until March 2027"
                />
                <button className="btn btn-outline btn-sm" onClick={() => setAvailability(vendor.id, false, note)}>
                  Save
                </button>
              </div>
            </label>
          )}

          <h3>Blocked / booked dates</h3>
          <p className="muted small">Block a date when you get booked outside WedConnect so couples can't request it.</p>
          <div className="input-with-button">
            <input type="date" min={todayISO()} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <button
              className="btn btn-primary btn-sm"
              disabled={!newDate}
              onClick={() => {
                blockDate(vendor.id, newDate)
                setNewDate('')
              }}
            >
              Block date
            </button>
          </div>
          <div className="date-chips">
            {upcomingDates.length ? (
              upcomingDates.map((d) => (
                <span key={d} className="chip chip-static">
                  {formatDate(d)}
                  <button aria-label={`Unblock ${d}`} onClick={() => unblockDate(vendor.id, d)}>
                    ✕
                  </button>
                </span>
              ))
            ) : (
              <span className="muted small">No upcoming blocked dates.</span>
            )}
          </div>
        </section>

        <section className="card">
          <h2>
            Booking requests {pending.length > 0 && <span className="count">{pending.length} new</span>}
          </h2>
          {requests.length ? (
            <ul className="request-list">
              {requests.map((b) => (
                <li key={b.id}>
                  <div>
                    <strong>{b.couple}</strong>
                    <span className="muted small">
                      {b.id} · {formatDate(b.date)} · {b.guests} guests
                    </span>
                    <span className="small">{b.service}</span>
                  </div>
                  {b.status === 'pending' ? (
                    <div className="request-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => setBookingStatus(b.id, 'confirmed')}>
                        Accept
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setBookingStatus(b.id, 'declined')}>
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className={b.status === 'confirmed' ? 'tag tag-green' : 'tag tag-red'}>{b.status}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No booking requests yet. Try sending one from your public profile.</p>
          )}
          <p className="muted small">Accepting a request automatically blocks that date.</p>
        </section>

        <section className="card dashboard-wide">
          <h2>Reviews waiting for your reply</h2>
          <p className="muted small">
            You can't delete reviews, but a calm, honest reply shows future couples how you handle problems.
          </p>
          {unanswered.length ? (
            <ul className="review-list">
              {unanswered.map((r) => (
                <li key={r.index} className={r.rating <= 2 ? 'review low' : 'review'}>
                  <div className="review-head">
                    <strong>{r.author}</strong>
                    <span className="muted small">{formatDate(r.date)}</span>
                  </div>
                  <StarRating value={r.rating} size="sm" />
                  <p>{r.text}</p>
                  <div className="input-with-button">
                    <input
                      placeholder="Write a public reply…"
                      value={replyDrafts[r.index] ?? ''}
                      onChange={(e) => setReplyDrafts({ ...replyDrafts, [r.index]: e.target.value })}
                    />
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={!replyDrafts[r.index]?.trim()}
                      onClick={() => {
                        replyToReview(vendor.id, r.index, replyDrafts[r.index].trim())
                        setReplyDrafts({ ...replyDrafts, [r.index]: '' })
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">You've replied to every review. 👏</p>
          )}
        </section>
      </div>
    </div>
  )
}
