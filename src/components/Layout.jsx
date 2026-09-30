import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../store/context'

const YEAR = new Date().getFullYear()

function Navbar() {
  const { favorites, user } = useStore()
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          Wed<span>Connect</span>
        </Link>
        <button className="menu-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          ☰
        </button>
        <nav className={open ? 'nav-links open' : 'nav-links'} onClick={() => setOpen(false)}>
          <NavLink to="/vendors">Find vendors</NavLink>
          <NavLink to="/community">Vendor community</NavLink>
          <NavLink to="/dashboard">Vendor dashboard</NavLink>
          <NavLink to="/vendors?saved=1" className="nav-saved">
            ♥ Saved{favorites.length > 0 && <span className="count">{favorites.length}</span>}
          </NavLink>
          {user ? (
            <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
          ) : (
            <Link to="/register" className="btn btn-primary btn-sm">
              Join free
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  const { resetDemo } = useStore()
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo">
            Wed<span>Connect</span>
          </div>
          <p className="muted">Where couples find trusted wedding vendors — and vendors grow together.</p>
        </div>
        <div>
          <h4>Couples</h4>
          <Link to="/register?role=bride">Register as a bride</Link>
          <Link to="/register?role=groom">Register as a groom</Link>
          <Link to="/vendors">Browse vendors</Link>
        </div>
        <div>
          <h4>Vendors</h4>
          <Link to="/register?role=vendor">Register as a vendor</Link>
          <Link to="/dashboard">Vendor dashboard</Link>
          <Link to="/community">Community</Link>
        </div>
        <div>
          <h4>Trust & safety</h4>
          <Link to="/#trust">How reviews work</Link>
          <a href="mailto:support@wedconnect.com">support@wedconnect.com</a>
          <button type="button" className="link-button" onClick={resetDemo}>
            Reset demo data
          </button>
        </div>
      </div>
      <div className="container footer-bottom muted">© {YEAR} WedConnect. All rights reserved.</div>
    </footer>
  )
}

export default function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
