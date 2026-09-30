import { Link } from 'react-router-dom'
import { categoryById } from '../data'
import { useStore } from '../store/context'
import { averageRating, formatPrice, startingPrice } from '../utils'
import StarRating from './StarRating'

export default function VendorCard({ vendor, date }) {
  const { favorites, toggleFavorite } = useStore()
  const rating = averageRating(vendor.reviews)
  const saved = favorites.includes(vendor.id)
  const bookedOnDate = date && vendor.bookedDates.includes(date)

  return (
    <article className="vendor-card">
      <Link to={`/vendors/${vendor.id}`} className="vendor-card-media">
        <img src={vendor.portfolio[0]?.src ?? vendor.cover} alt={`${vendor.name} work sample`} loading="lazy" />
        {!vendor.available ? (
          <span className="badge badge-unavailable">Unavailable</span>
        ) : bookedOnDate ? (
          <span className="badge badge-unavailable">Booked on this date</span>
        ) : date ? (
          <span className="badge badge-available">Free on this date</span>
        ) : null}
      </Link>
      <button
        type="button"
        className={saved ? 'heart saved' : 'heart'}
        aria-label={saved ? 'Remove from saved' : 'Save vendor'}
        onClick={() => toggleFavorite(vendor.id)}
      >
        {saved ? '♥' : '♡'}
      </button>
      <div className="vendor-card-body">
        <div className="vendor-card-cat">
          {categoryById[vendor.category].icon} {categoryById[vendor.category].name} · {vendor.location}
        </div>
        <h3>
          <Link to={`/vendors/${vendor.id}`}>{vendor.name}</Link>
          {vendor.verified && (
            <span className="verified" title="Verified business">
              ✔
            </span>
          )}
        </h3>
        <p className="muted">{vendor.tagline}</p>
        <div className="vendor-card-footer">
          <span className="rating-inline">
            <StarRating value={rating} size="sm" />
            <strong>{rating.toFixed(1)}</strong>
            <span className="muted">({vendor.reviews.length})</span>
          </span>
          <span className="price">
            from <strong>{formatPrice(startingPrice(vendor))}</strong>
            {vendor.priceUnit && <span className="muted"> {vendor.priceUnit}</span>}
          </span>
        </div>
      </div>
    </article>
  )
}
