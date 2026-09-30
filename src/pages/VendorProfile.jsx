import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { categoryById } from '../data'
import { useStore } from '../store/context'
import { averageRating, formatDate, formatPrice, ratingBreakdown, todayISO } from '../utils'
import NotFound from './NotFound'

function Lightbox({ items, index, onClose, onMove }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onMove(1)
      if (e.key === 'ArrowLeft') onMove(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onMove])

  const item = items[index]
  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        {item.type === 'video' ? (
          <video src={item.src} poster={item.poster} controls autoPlay />
        ) : (
          <img src={item.src.replace('/900/650', '/1400/1000')} alt={item.caption} />
        )}
        <p>
          {item.caption} <span className="muted">· {index + 1} / {items.length}</span>
        </p>
        <button className="lightbox-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <button className="lightbox-nav prev" onClick={() => onMove(-1)} aria-label="Previous">
          ‹
        </button>
        <button className="lightbox-nav next" onClick={() => onMove(1)} aria-label="Next">
          ›
        </button>
      </div>
    </div>
  )
}

function Portfolio({ items }) {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const shown = items.filter((i) => filter === 'all' || i.type === filter)
  const photos = items.filter((i) => i.type === 'image').length
  const videos = items.length - photos

  return (
    <section className="card" id="portfolio">
      <div className="card-head">
        <h2>Portfolio</h2>
        <div className="toggle-group small">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            All ({items.length})
          </button>
          <button className={filter === 'image' ? 'active' : ''} onClick={() => setFilter('image')}>
            Photos ({photos})
          </button>
          {videos > 0 && (
            <button className={filter === 'video' ? 'active' : ''} onClick={() => setFilter('video')}>
              Videos ({videos})
            </button>
          )}
        </div>
      </div>
      <div className="gallery">
        {shown.map((item, i) => (
          <button key={`${item.src}-${item.caption}`} className="gallery-item" onClick={() => setOpen(i)}>
            <img src={item.type === 'video' ? item.poster : item.src} alt={item.caption} loading="lazy" />
            {item.type === 'video' && <span className="play">▶</span>}
            <span className="gallery-caption">{item.caption}</span>
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox
          items={shown}
          index={open}
          onClose={() => setOpen(null)}
          onMove={(step) => setOpen((i) => (i + step + shown.length) % shown.length)}
        />
      )}
    </section>
  )
}

function ReviewForm({ vendorId, onDone }) {
  const { addReview, user } = useStore()
  const [form, setForm] = useState({ author: user?.name ?? '', role: 'Couple', rating: 0, text: '' })
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!form.rating) return setError('Please choose a star rating.')
    if (form.text.trim().length < 20) return setError('Please write at least 20 characters so others can learn from it.')
    addReview(vendorId, { ...form, date: todayISO(), verified: false })
    onDone()
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <h3>Rate this vendor</h3>
      <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} size="lg" />
      <div className="form-row">
        <label>
          <span>Your name</span>
          <input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </label>
        <label>
          <span>You are</span>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option>Couple</option>
            <option>Bride</option>
            <option>Groom</option>
            <option>Wedding guest</option>
          </select>
        </label>
      </div>
      <label>
        <span>Your experience</span>
        <textarea
          rows="4"
          placeholder="What went well? What went wrong? Be honest — it helps other couples."
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />
      </label>
      {error && <p className="error">{error}</p>}
      <p className="muted small">
        Reviews from couples who booked through WedConnect get a “Verified booking” badge. Vendors can reply but
        can't remove reviews.
      </p>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Cancel
        </button>
        <button className="btn btn-primary">Post review</button>
      </div>
    </form>
  )
}

function Reviews({ vendor }) {
  const [sort, setSort] = useState('recent')
  const [writing, setWriting] = useState(false)
  const rating = averageRating(vendor.reviews)
  const breakdown = ratingBreakdown(vendor.reviews)
  const total = vendor.reviews.length

  const sorted = [...vendor.reviews].sort((a, b) => {
    if (sort === 'highest') return b.rating - a.rating
    if (sort === 'lowest') return a.rating - b.rating
    return b.date.localeCompare(a.date)
  })

  return (
    <section className="card" id="reviews">
      <div className="card-head">
        <h2>Reviews</h2>
        {!writing && (
          <button className="btn btn-outline btn-sm" onClick={() => setWriting(true)}>
            Write a review
          </button>
        )}
      </div>

      <div className="review-summary">
        <div className="review-score">
          <strong>{rating.toFixed(1)}</strong>
          <StarRating value={rating} />
          <span className="muted">
            {total} review{total === 1 ? '' : 's'}
          </span>
        </div>
        <div className="review-bars">
          {breakdown.map((b) => (
            <div key={b.stars} className="bar-row">
              <span>{b.stars} ★</span>
              <div className="bar">
                <div style={{ width: total ? `${(b.count / total) * 100}%` : 0 }} />
              </div>
              <span className="muted">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {writing && <ReviewForm vendorId={vendor.id} onDone={() => setWriting(false)} />}

      <div className="results-bar">
        <span className="muted">Showing all reviews — including the bad ones.</span>
        <label className="inline">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Most recent</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </label>
      </div>

      <ul className="review-list">
        {sorted.map((r) => (
          <li key={`${r.author}-${r.date}`} className={r.rating <= 2 ? 'review low' : 'review'}>
            <div className="review-head">
              <div>
                <strong>{r.author}</strong> <span className="muted">· {r.role}</span>
                {r.verified && <span className="tag tag-green">Verified booking</span>}
              </div>
              <span className="muted small">{formatDate(r.date)}</span>
            </div>
            <StarRating value={r.rating} size="sm" />
            <p>{r.text}</p>
            {r.reply && (
              <div className="vendor-reply">
                <strong>Response from {vendor.name}</strong>
                <p>{r.reply}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function AvailabilityCard({ vendor }) {
  const [date, setDate] = useState('')
  const upcoming = vendor.bookedDates.filter((d) => d >= todayISO()).slice(0, 6)
  const isBooked = date && vendor.bookedDates.includes(date)

  return (
    <div className="card side-card">
      <h3>Availability</h3>
      {!vendor.available ? (
        <div className="notice notice-warn">
          <strong>Currently unavailable</strong>
          <p>{vendor.unavailableNote || 'This vendor is not taking new bookings right now.'}</p>
        </div>
      ) : (
        <>
          <label>
            <span>Check your date</span>
            <input type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          {date &&
            (isBooked ? (
              <p className="notice notice-warn">Already booked on {formatDate(date)}.</p>
            ) : (
              <p className="notice notice-ok">Free on {formatDate(date)} 🎉</p>
            ))}
          {upcoming.length > 0 && (
            <>
              <p className="muted small">Booked dates coming up:</p>
              <div className="date-chips">
                {upcoming.map((d) => (
                  <span key={d} className="chip chip-static">
                    {formatDate(d)}
                  </span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function ContactCard({ vendor }) {
  const [revealed, setRevealed] = useState(false)
  const c = vendor.contact
  const waLink = `https://wa.me/${c.whatsapp.replace(/\D/g, '')}`

  return (
    <div className="card side-card">
      <h3>Contact</h3>
      <p>
        <strong>{c.person}</strong>
        <br />
        <span className="muted small">Usually responds {vendor.responseTime}</span>
      </p>
      {revealed ? (
        <ul className="contact-list">
          <li>
            📧 <a href={`mailto:${c.email}`}>{c.email}</a>
          </li>
          <li>
            📞 <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
          </li>
          <li>
            💬{' '}
            <a href={waLink} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </li>
          <li>
            🌐{' '}
            <a href={`https://${c.website}`} target="_blank" rel="noreferrer">
              {c.website}
            </a>
          </li>
          <li>📷 {c.instagram}</li>
        </ul>
      ) : (
        <button className="btn btn-outline btn-block" onClick={() => setRevealed(true)}>
          Show contact details
        </button>
      )}
      <p className="muted small">
        Tip: book through WedConnect so you can leave a verified review and get our booking protection.
      </p>
    </div>
  )
}

export default function VendorProfile() {
  const { id } = useParams()
  const { vendors, favorites, toggleFavorite } = useStore()
  const vendor = vendors.find((v) => v.id === id)
  if (!vendor) return <NotFound />

  const category = categoryById[vendor.category]
  const rating = averageRating(vendor.reviews)
  const saved = favorites.includes(vendor.id)

  return (
    <div className="profile">
      <div className="profile-cover" style={{ backgroundImage: `url(${vendor.cover})` }} />
      <div className="container">
        <div className="profile-header card">
          <img className="avatar" src={vendor.avatar} alt="" />
          <div className="profile-title">
            <Link to={`/vendors?category=${category.id}`} className="muted small">
              {category.icon} {category.name}
            </Link>
            <h1>
              {vendor.name}
              {vendor.verified && <span className="verified">✔ Verified</span>}
            </h1>
            <p className="muted">{vendor.tagline}</p>
            <div className="profile-meta">
              <a href="#reviews" className="rating-inline">
                <StarRating value={rating} size="sm" />
                <strong>{rating.toFixed(1)}</strong>
                <span className="muted">({vendor.reviews.length} reviews)</span>
              </a>
              <span>📍 {vendor.location}</span>
              <span>🗓 {vendor.yearsExperience} years</span>
              <span>💍 {vendor.weddingsCompleted} weddings</span>
              {vendor.available ? (
                <span className="tag tag-green">Taking bookings</span>
              ) : (
                <span className="tag tag-red">Unavailable</span>
              )}
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-ghost" onClick={() => toggleFavorite(vendor.id)}>
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
            {vendor.available ? (
              <Link to={`/book/${vendor.id}`} className="btn btn-primary">
                Request booking
              </Link>
            ) : (
              <button className="btn btn-primary" disabled>
                Not taking bookings
              </button>
            )}
          </div>
        </div>

        <nav className="profile-tabs">
          <a href="#about">About</a>
          <a href="#services">Services & prices</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#reviews">Reviews</a>
        </nav>

        <div className="profile-layout">
          <div className="profile-main">
            <section className="card" id="about">
              <h2>About</h2>
              <p>{vendor.about}</p>
              <p className="muted small">Languages: {vendor.languages.join(', ')}</p>
            </section>

            <section className="card" id="services">
              <h2>Services & prices</h2>
              <div className="service-list">
                {vendor.services.map((s) => (
                  <div key={s.name} className="service">
                    <div>
                      <h3>{s.name}</h3>
                      <p className="muted">{s.description}</p>
                    </div>
                    <div className="service-price">
                      <strong>{formatPrice(s.price)}</strong>
                      {vendor.priceUnit && <span className="muted small">{vendor.priceUnit}</span>}
                      {vendor.available && (
                        <Link
                          to={`/book/${vendor.id}?service=${encodeURIComponent(s.name)}`}
                          className="btn btn-outline btn-sm"
                        >
                          Choose
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Portfolio items={vendor.portfolio} />
            <Reviews vendor={vendor} />
          </div>

          <aside className="profile-side">
            <AvailabilityCard vendor={vendor} />
            <ContactCard vendor={vendor} />
          </aside>
        </div>
      </div>
    </div>
  )
}
