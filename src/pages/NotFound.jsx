import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container page narrow center">
      <h1>Page not found</h1>
      <p className="muted">The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className="btn btn-primary">
        Back home
      </Link>
    </div>
  )
}
