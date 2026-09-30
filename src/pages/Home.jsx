import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VendorCard from '../components/VendorCard'
import { categories, howItWorks, locations, platformStats, testimonials } from '../data'
import { useStore } from '../store/context'
import { averageRating } from '../utils'

export default function Home() {
  const { vendors } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState({ category: '', location: '', date: '' })
  const [audience, setAudience] = useState('couples')

  const featured = [...vendors]
    .filter((v) => v.available)
    .sort((a, b) => averageRating(b.reviews) - averageRating(a.reviews))
    .slice(0, 4)

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(Object.entries(search).filter(([, v]) => v))
    navigate(`/vendors?${params}`)
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">The wedding vendor marketplace</p>
          <h1>
            Every vendor for your big day,
            <br />
            <em>reviewed by real couples.</em>
          </h1>
          <p className="hero-sub">
            Find photographers, caterers, decorators and more. Check their real work, read honest reviews, and book
            the vendors who are free on your date.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <label>
              <span>What do you need?</span>
              <select value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })}>
                <option value="">All vendors</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Where?</span>
              <select value={search.location} onChange={(e) => setSearch({ ...search, location: e.target.value })}>
                <option value="">Any location</option>
                {locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Wedding date</span>
              <input type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} />
            </label>
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>
          <div className="hero-cta">
            <Link to="/register?role=bride" className="btn btn-light">
              I'm a bride
            </Link>
            <Link to="/register?role=groom" className="btn btn-light">
              I'm a groom
            </Link>
            <Link to="/register?role=vendor" className="btn btn-outline-light">
              I'm a vendor
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container stats-grid">
          {platformStats.map((s) => (
            <div key={s.label} className="stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Browse by category</h2>
            <Link to="/vendors">See all vendors →</Link>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <Link key={c.id} to={`/vendors?category=${c.id}`} className="category-tile">
                <span className="category-icon">{c.icon}</span>
                <strong>{c.name}</strong>
                <span className="muted">{vendors.filter((v) => v.category === c.id).length} vendors</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Top-rated vendors</h2>
            <Link to="/vendors?sort=rating">View all →</Link>
          </div>
          <div className="vendor-grid">
            {featured.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="center">How WedConnect works</h2>
          <div className="toggle-group center-block">
            <button className={audience === 'couples' ? 'active' : ''} onClick={() => setAudience('couples')}>
              For couples
            </button>
            <button className={audience === 'vendors' ? 'active' : ''} onClick={() => setAudience('vendors')}>
              For vendors
            </button>
          </div>
          <ol className="steps">
            {howItWorks[audience].map((step, i) => (
              <li key={step.title}>
                <span className="step-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p className="muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt" id="trust">
        <div className="container trust-grid">
          <div>
            <p className="eyebrow">Trust & safety</p>
            <h2>Reviews you can actually trust</h2>
            <p className="muted">
              A vendor who lets a couple down on their wedding day shouldn't get to hide it. On WedConnect every
              review is tied to a real booking, and every rating is public.
            </p>
          </div>
          <ul className="trust-list">
            <li>
              <strong>⭐ Verified-booking reviews</strong>
              <span>Only couples who booked through WedConnect can rate a vendor, from 1 to 5 stars.</span>
            </li>
            <li>
              <strong>💬 Public vendor replies</strong>
              <span>Vendors can respond to reviews and explain how they fixed a problem, but can't delete them.</span>
            </li>
            <li>
              <strong>✔ Verified businesses</strong>
              <span>The verified badge means we checked the vendor's ID, business registration and past work.</span>
            </li>
            <li>
              <strong>📅 Real availability</strong>
              <span>Vendors block booked dates and can mark themselves fully booked, so you don't waste time.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="center">What people say</h2>
          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <figure key={t.author} className="testimonial">
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <strong>{t.author}</strong>
                  <span className="muted">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Are you a wedding vendor?</h2>
            <p>Join more than 1,200 vendors getting bookings and building partnerships on WedConnect.</p>
          </div>
          <Link to="/register?role=vendor" className="btn btn-light">
            List your business free
          </Link>
        </div>
      </section>
    </>
  )
}
