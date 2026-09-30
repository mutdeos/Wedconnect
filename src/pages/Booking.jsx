import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { categoryById } from '../data'
import { useStore } from '../store/context'
import { averageRating, formatDate, formatPrice, todayISO } from '../utils'
import NotFound from './NotFound'

// One booking form shared by every vendor — only the service list changes.
export default function Booking() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { vendors, addBooking, user } = useStore()
  const vendor = vendors.find((v) => v.id === id)

  const [form, setForm] = useState({
    bookingAs: user?.role === 'groom' ? 'Groom' : user?.role === 'bride' ? 'Bride' : 'Bride',
    brideName: user?.role === 'bride' ? user.name : '',
    groomName: user?.role === 'groom' ? user.name : '',
    email: user?.email ?? '',
    phone: '',
    contactMethod: 'Email',
    date: user?.weddingDate ?? '',
    time: '',
    venue: '',
    guests: '',
    service: params.get('service') ?? vendor?.services[0]?.name ?? '',
    budget: '',
    notes: '',
    agree: false,
  })
  const [submitted, setSubmitted] = useState(null)

  if (!vendor) return <NotFound />

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const service = vendor.services.find((s) => s.name === form.service)
  const guests = Number(form.guests) || 0
  const estimate = service ? (vendor.priceUnit ? service.price * guests : service.price) : 0
  const dateTaken = form.date && vendor.bookedDates.includes(form.date)
  const rating = averageRating(vendor.reviews)

  const submit = (e) => {
    e.preventDefault()
    if (dateTaken || !vendor.available) return
    const booking = {
      id: `WC-${Math.floor(10000 + Math.random() * 90000)}`,
      vendorId: vendor.id,
      couple: [form.brideName, form.groomName].filter(Boolean).join(' & '),
      date: form.date,
      service: form.service,
      guests,
      status: 'pending',
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      createdAt: todayISO(),
    }
    addBooking(booking)
    setSubmitted(booking)
    window.scrollTo(0, 0)
  }

  if (submitted) {
    return (
      <div className="container page narrow">
        <div className="card confirmation">
          <div className="confirm-icon">💌</div>
          <h1>Booking request sent!</h1>
          <p>
            Your request <strong>{submitted.id}</strong> was sent to <strong>{vendor.name}</strong>. They usually
            respond {vendor.responseTime}.
          </p>
          <dl className="summary-list">
            <div>
              <dt>Service</dt>
              <dd>{submitted.service}</dd>
            </div>
            <div>
              <dt>Wedding date</dt>
              <dd>{formatDate(submitted.date)}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{submitted.guests}</dd>
            </div>
            <div>
              <dt>Estimated price</dt>
              <dd>{formatPrice(estimate)}</dd>
            </div>
          </dl>
          <h3>What happens next?</h3>
          <ol className="next-steps">
            <li>The vendor reviews your request and confirms or suggests changes.</li>
            <li>You'll get an email at {submitted.email} with their answer.</li>
            <li>Once confirmed, the date is blocked on their calendar just for you.</li>
            <li>After the wedding, you'll be invited to leave a verified review.</li>
          </ol>
          <div className="form-actions center">
            <Link to={`/vendors/${vendor.id}`} className="btn btn-ghost">
              Back to {vendor.name}
            </Link>
            <Link to="/vendors" className="btn btn-primary">
              Find more vendors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <Link to={`/vendors/${vendor.id}`} className="back-link">
        ← Back to profile
      </Link>
      <h1>Request a booking</h1>

      <div className="booking-layout">
        <form className="card booking-form" onSubmit={submit}>
          <fieldset>
            <legend>1. Your details</legend>
            <label>
              <span>I am booking as</span>
              <select value={form.bookingAs} onChange={set('bookingAs')}>
                <option>Bride</option>
                <option>Groom</option>
                <option>Both of us</option>
                <option>Family member</option>
                <option>Wedding planner</option>
              </select>
            </label>
            <div className="form-row">
              <label>
                <span>Bride's full name *</span>
                <input required value={form.brideName} onChange={set('brideName')} />
              </label>
              <label>
                <span>Groom's full name *</span>
                <input required value={form.groomName} onChange={set('groomName')} />
              </label>
            </div>
            <div className="form-row">
              <label>
                <span>Email *</span>
                <input required type="email" value={form.email} onChange={set('email')} />
              </label>
              <label>
                <span>Phone number *</span>
                <input required type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
              </label>
            </div>
            <label>
              <span>Preferred contact method</span>
              <div className="radio-row">
                {['Email', 'Phone call', 'WhatsApp'].map((m) => (
                  <label key={m} className="checkbox">
                    <input
                      type="radio"
                      name="contactMethod"
                      value={m}
                      checked={form.contactMethod === m}
                      onChange={set('contactMethod')}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </label>
          </fieldset>

          <fieldset>
            <legend>2. Wedding details</legend>
            <div className="form-row">
              <label>
                <span>Wedding date *</span>
                <input required type="date" min={todayISO()} value={form.date} onChange={set('date')} />
              </label>
              <label>
                <span>Start time</span>
                <input type="time" value={form.time} onChange={set('time')} />
              </label>
            </div>
            {dateTaken && (
              <p className="notice notice-warn">
                {vendor.name} is already booked on {formatDate(form.date)}. Please pick another date or browse
                similar vendors.
              </p>
            )}
            <div className="form-row">
              <label>
                <span>Venue / location *</span>
                <input required value={form.venue} onChange={set('venue')} placeholder="Venue name or address" />
              </label>
              <label>
                <span>Number of guests *</span>
                <input required type="number" min="1" value={form.guests} onChange={set('guests')} />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>3. Service</legend>
            <div className="service-options">
              {vendor.services.map((s) => (
                <label key={s.name} className={form.service === s.name ? 'service-option selected' : 'service-option'}>
                  <input type="radio" name="service" value={s.name} checked={form.service === s.name} onChange={set('service')} />
                  <div>
                    <strong>{s.name}</strong>
                    <span className="muted small">{s.description}</span>
                  </div>
                  <span className="price">
                    {formatPrice(s.price)}
                    {vendor.priceUnit && <small> {vendor.priceUnit}</small>}
                  </span>
                </label>
              ))}
            </div>
            <div className="form-row">
              <label>
                <span>Your total budget for this vendor</span>
                <input type="number" min="0" value={form.budget} onChange={set('budget')} placeholder="Optional" />
              </label>
            </div>
            <label>
              <span>Anything else the vendor should know?</span>
              <textarea
                rows="4"
                value={form.notes}
                onChange={set('notes')}
                placeholder="Theme, dietary needs, special requests, schedule…"
              />
            </label>
          </fieldset>

          <label className="checkbox">
            <input type="checkbox" required checked={form.agree} onChange={set('agree')} />I agree to share these details
            with {vendor.name} and accept the WedConnect booking terms.
          </label>

          <button className="btn btn-primary btn-block" disabled={dateTaken || !vendor.available}>
            {vendor.available ? 'Send booking request' : 'Vendor is unavailable'}
          </button>
          <p className="muted small center">No payment now — you only pay once the vendor confirms.</p>
        </form>

        <aside className="card booking-summary">
          <img src={vendor.cover} alt="" className="summary-cover" />
          <p className="muted small">
            {categoryById[vendor.category].icon} {categoryById[vendor.category].name}
          </p>
          <h3>{vendor.name}</h3>
          <span className="rating-inline">
            <StarRating value={rating} size="sm" />
            <strong>{rating.toFixed(1)}</strong>
            <span className="muted">({vendor.reviews.length})</span>
          </span>
          <hr />
          <dl className="summary-list">
            <div>
              <dt>Service</dt>
              <dd>{form.service || '—'}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{form.date ? formatDate(form.date) : '—'}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{guests || '—'}</dd>
            </div>
            <div className="summary-total">
              <dt>Estimated total</dt>
              <dd>{estimate ? formatPrice(estimate) : '—'}</dd>
            </div>
          </dl>
          {vendor.priceUnit && <p className="muted small">Priced {vendor.priceUnit} × number of guests.</p>}
          <p className="muted small">Final price is confirmed by the vendor.</p>
        </aside>
      </div>
    </div>
  )
}
