import { useSearchParams } from 'react-router-dom'
import VendorCard from '../components/VendorCard'
import { categories, categoryById, CURRENCY, locations } from '../data'
import { useStore } from '../store/context'
import { averageRating, startingPrice } from '../utils'

const SORTS = {
  rating: { label: 'Highest rated', fn: (a, b) => averageRating(b.reviews) - averageRating(a.reviews) },
  reviews: { label: 'Most reviewed', fn: (a, b) => b.reviews.length - a.reviews.length },
  priceLow: { label: 'Price: low to high', fn: (a, b) => startingPrice(a) - startingPrice(b) },
  priceHigh: { label: 'Price: high to low', fn: (a, b) => startingPrice(b) - startingPrice(a) },
  experience: { label: 'Most experienced', fn: (a, b) => b.yearsExperience - a.yearsExperience },
}

export default function Vendors() {
  const { vendors, favorites } = useStore()
  const [params, setParams] = useSearchParams()

  const filters = {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    service: params.get('service') ?? '',
    location: params.get('location') ?? '',
    date: params.get('date') ?? '',
    minRating: params.get('minRating') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    availableOnly: params.get('availableOnly') === '1',
    verifiedOnly: params.get('verifiedOnly') === '1',
    saved: params.get('saved') === '1',
    sort: params.get('sort') ?? 'rating',
  }

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params)
    if (value === '' || value === false) next.delete(key)
    else next.set(key, value === true ? '1' : value)
    if (key === 'category') next.delete('service')
    setParams(next, { replace: true })
  }

  const serviceOptions = filters.category ? categoryById[filters.category].serviceOptions : []

  const results = vendors
    .filter((v) => {
      const q = filters.q.toLowerCase()
      if (q && !`${v.name} ${v.tagline} ${v.about}`.toLowerCase().includes(q)) return false
      if (filters.category && v.category !== filters.category) return false
      if (filters.service && !v.services.some((s) => s.name === filters.service)) return false
      if (filters.location && v.location !== filters.location) return false
      if (filters.minRating && averageRating(v.reviews) < Number(filters.minRating)) return false
      if (filters.maxPrice && startingPrice(v) > Number(filters.maxPrice)) return false
      if (filters.verifiedOnly && !v.verified) return false
      if (filters.saved && !favorites.includes(v.id)) return false
      if (filters.availableOnly || filters.date) {
        if (!v.available) return false
        if (filters.date && v.bookedDates.includes(filters.date)) return false
      }
      return true
    })
    .sort(SORTS[filters.sort]?.fn ?? SORTS.rating.fn)

  return (
    <div className="container page">
      <div className="page-head">
        <h1>{filters.saved ? 'Saved vendors' : filters.category ? categoryById[filters.category].name : 'Find vendors'}</h1>
        <p className="muted">
          {filters.category
            ? categoryById[filters.category].blurb
            : 'Compare vendors by rating, price, service type and availability.'}
        </p>
      </div>

      <div className="category-chips">
        <button className={!filters.category ? 'chip active' : 'chip'} onClick={() => setFilter('category', '')}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={filters.category === c.id ? 'chip active' : 'chip'}
            onClick={() => setFilter('category', c.id)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="listing-layout">
        <aside className="filters">
          <label>
            <span>Search</span>
            <input
              type="search"
              placeholder="Name or keyword"
              value={filters.q}
              onChange={(e) => setFilter('q', e.target.value)}
            />
          </label>

          {serviceOptions.length > 0 && (
            <label>
              <span>Service option</span>
              <select value={filters.service} onChange={(e) => setFilter('service', e.target.value)}>
                <option value="">Any service</option>
                {serviceOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          )}

          <label>
            <span>Location</span>
            <select value={filters.location} onChange={(e) => setFilter('location', e.target.value)}>
              <option value="">Any location</option>
              {locations.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Wedding date</span>
            <input type="date" value={filters.date} onChange={(e) => setFilter('date', e.target.value)} />
            {filters.date && <small className="muted">Showing only vendors free on this date</small>}
          </label>

          <label>
            <span>Minimum rating</span>
            <select value={filters.minRating} onChange={(e) => setFilter('minRating', e.target.value)}>
              <option value="">Any rating</option>
              <option value="4.5">4.5 ★ and up</option>
              <option value="4">4 ★ and up</option>
              <option value="3">3 ★ and up</option>
            </select>
          </label>

          <label>
            <span>Max starting price ({CURRENCY})</span>
            <input
              type="number"
              min="0"
              placeholder="No limit"
              value={filters.maxPrice}
              onChange={(e) => setFilter('maxPrice', e.target.value)}
            />
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(e) => setFilter('availableOnly', e.target.checked)}
            />
            Hide unavailable vendors
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilter('verifiedOnly', e.target.checked)}
            />
            Verified businesses only
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={filters.saved} onChange={(e) => setFilter('saved', e.target.checked)} />
            Saved vendors only
          </label>

          <button className="btn btn-ghost btn-sm" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </button>
        </aside>

        <section>
          <div className="results-bar">
            <span>
              <strong>{results.length}</strong> vendor{results.length === 1 ? '' : 's'} found
            </span>
            <label className="inline">
              Sort by
              <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {results.length ? (
            <div className="vendor-grid">
              {results.map((v) => (
                <VendorCard key={v.id} vendor={v} date={filters.date} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>No vendors match these filters.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
