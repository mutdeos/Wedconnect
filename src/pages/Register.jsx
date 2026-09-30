import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { categories, categoryById, locations } from '../data'
import { useStore } from '../store/context'
import { todayISO } from '../utils'

const ROLES = {
  bride: { label: 'Bride', icon: '👰', intro: 'Plan your wedding, save vendors and book in a few clicks.' },
  groom: { label: 'Groom', icon: '🤵', intro: 'Plan your wedding, save vendors and book in a few clicks.' },
  vendor: { label: 'Vendor', icon: '💼', intro: 'List your business, show your work and get booked by couples.' },
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  // couple fields
  partnerName: '',
  weddingDate: '',
  location: '',
  guests: '',
  budget: '',
  needs: [],
  // vendor fields
  businessName: '',
  category: '',
  services: [],
  years: '',
  startingPrice: '',
  description: '',
  website: '',
  instagram: '',
  terms: false,
}

export default function Register() {
  const [params, setParams] = useSearchParams()
  const role = ROLES[params.get('role')] ? params.get('role') : 'bride'
  const { setUser } = useStore()
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const toggleIn = (key, value) =>
    setForm({
      ...form,
      [key]: form[key].includes(value) ? form[key].filter((v) => v !== value) : [...form[key], value],
    })

  const onFiles = (e) => {
    const picked = [...e.target.files].slice(0, 12).map((f) => ({
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(f),
    }))
    setFiles(picked)
  }

  const submit = (e) => {
    e.preventDefault()
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (role === 'vendor' && !form.services.length) return setError('Pick at least one service you offer.')
    setError('')
    setUser({ name: role === 'vendor' ? form.businessName : form.name, email: form.email, role, weddingDate: form.weddingDate })
    setDone(true)
    window.scrollTo(0, 0)
  }

  if (done) {
    return (
      <div className="container page narrow">
        <div className="card confirmation">
          <div className="confirm-icon">{ROLES[role].icon}</div>
          <h1>Welcome to WedConnect!</h1>
          {role === 'vendor' ? (
            <>
              <p>
                <strong>{form.businessName}</strong> has been created. Our team will verify your business within 48
                hours. Until then, your profile is visible without the verified badge.
              </p>
              <div className="form-actions center">
                <Link to="/dashboard" className="btn btn-primary">
                  Go to vendor dashboard
                </Link>
                <Link to="/community" className="btn btn-ghost">
                  Meet other vendors
                </Link>
              </div>
            </>
          ) : (
            <>
              <p>Your account is ready, {form.name.split(' ')[0]}. Let's find your dream team of vendors.</p>
              <div className="form-actions center">
                <Link
                  to={`/vendors${form.weddingDate ? `?date=${form.weddingDate}` : ''}`}
                  className="btn btn-primary"
                >
                  Find vendors free on your date
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const serviceOptions = form.category ? categoryById[form.category].serviceOptions : []

  return (
    <div className="container page narrow">
      <h1 className="center">Create your account</h1>
      <div className="role-tabs">
        {Object.entries(ROLES).map(([key, r]) => (
          <button
            key={key}
            className={role === key ? 'role-tab active' : 'role-tab'}
            onClick={() => setParams({ role: key })}
          >
            <span>{r.icon}</span>
            Register as a {r.label.toLowerCase()}
          </button>
        ))}
      </div>
      <p className="center muted">{ROLES[role].intro}</p>

      <form className="card register-form" onSubmit={submit}>
        {role === 'vendor' ? (
          <fieldset>
            <legend>Business details</legend>
            <div className="form-row">
              <label>
                <span>Business name *</span>
                <input required value={form.businessName} onChange={set('businessName')} />
              </label>
              <label>
                <span>Contact person *</span>
                <input required value={form.name} onChange={set('name')} />
              </label>
            </div>
            <div className="form-row">
              <label>
                <span>Vendor type *</span>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, services: [] })}
                >
                  <option value="">Choose a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Main location *</span>
                <select required value={form.location} onChange={set('location')}>
                  <option value="">Choose</option>
                  {locations.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
            </div>
            {serviceOptions.length > 0 && (
              <div className="field">
                <span>Which services do you offer? *</span>
                <div className="check-grid">
                  {serviceOptions.map((s) => (
                    <label key={s} className="checkbox pill">
                      <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggleIn('services', s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="form-row">
              <label>
                <span>Years of experience</span>
                <input type="number" min="0" value={form.years} onChange={set('years')} />
              </label>
              <label>
                <span>Starting price</span>
                <input type="number" min="0" value={form.startingPrice} onChange={set('startingPrice')} />
              </label>
            </div>
            <label>
              <span>Describe your business *</span>
              <textarea
                required
                rows="4"
                value={form.description}
                onChange={set('description')}
                placeholder="What makes your work special? What's included?"
              />
            </label>
            <div className="field">
              <span>Portfolio — photos & videos of your past work</span>
              <label className="dropzone">
                <input type="file" accept="image/*,video/*" multiple onChange={onFiles} />
                <strong>Click to upload</strong>
                <span className="muted small">Up to 12 files. Couples trust vendors with at least 6 samples.</span>
              </label>
              {files.length > 0 && (
                <div className="upload-preview">
                  {files.map((f) =>
                    f.type === 'video' ? (
                      <video key={f.url} src={f.url} muted />
                    ) : (
                      <img key={f.url} src={f.url} alt={f.name} />
                    ),
                  )}
                </div>
              )}
            </div>
            <div className="form-row">
              <label>
                <span>Website</span>
                <input value={form.website} onChange={set('website')} placeholder="yourbusiness.com" />
              </label>
              <label>
                <span>Instagram</span>
                <input value={form.instagram} onChange={set('instagram')} placeholder="@yourbusiness" />
              </label>
            </div>
          </fieldset>
        ) : (
          <fieldset>
            <legend>About your wedding</legend>
            <div className="form-row">
              <label>
                <span>Your full name *</span>
                <input required value={form.name} onChange={set('name')} />
              </label>
              <label>
                <span>{role === 'bride' ? "Groom's" : "Bride's"} name</span>
                <input value={form.partnerName} onChange={set('partnerName')} />
              </label>
            </div>
            <div className="form-row">
              <label>
                <span>Wedding date</span>
                <input type="date" min={todayISO()} value={form.weddingDate} onChange={set('weddingDate')} />
              </label>
              <label>
                <span>Wedding location</span>
                <select value={form.location} onChange={set('location')}>
                  <option value="">Not decided yet</option>
                  {locations.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                <span>Estimated guests</span>
                <input type="number" min="0" value={form.guests} onChange={set('guests')} />
              </label>
              <label>
                <span>Total budget</span>
                <input type="number" min="0" value={form.budget} onChange={set('budget')} />
              </label>
            </div>
            <div className="field">
              <span>Which vendors are you still looking for?</span>
              <div className="check-grid">
                {categories.map((c) => (
                  <label key={c.id} className="checkbox pill">
                    <input type="checkbox" checked={form.needs.includes(c.id)} onChange={() => toggleIn('needs', c.id)} />
                    {c.icon} {c.name}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend>Account</legend>
          <div className="form-row">
            <label>
              <span>Email *</span>
              <input required type="email" value={form.email} onChange={set('email')} />
            </label>
            <label>
              <span>Phone number *</span>
              <input required type="tel" value={form.phone} onChange={set('phone')} />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>Password *</span>
              <input required type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
            </label>
            <label>
              <span>Confirm password *</span>
              <input required type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            </label>
          </div>
        </fieldset>

        <label className="checkbox">
          <input type="checkbox" required checked={form.terms} onChange={set('terms')} />
          {role === 'vendor'
            ? 'I agree to the vendor terms, including that couples can publicly review my work.'
            : 'I agree to the terms of service and privacy policy.'}
        </label>

        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block">Create {ROLES[role].label.toLowerCase()} account</button>
      </form>
    </div>
  )
}
