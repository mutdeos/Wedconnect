import { useState } from 'react'
import { categoryById, communityTopics } from '../data'
import { useStore } from '../store/context'
import { formatDate, todayISO } from '../utils'

function Thread({ thread }) {
  const { vendors, addReply, likeThread } = useStore()
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState('')
  const author = vendors.find((v) => v.name === thread.author)

  const submit = (e) => {
    e.preventDefault()
    if (!reply.trim()) return
    addReply(thread.id, { author: 'You', date: todayISO(), text: reply.trim() })
    setReply('')
  }

  return (
    <article className="card thread">
      <div className="thread-meta">
        {author && <img src={author.avatar} alt="" className="avatar-sm" />}
        <div>
          <strong>{thread.author}</strong>
          <span className="muted small">
            {categoryById[thread.authorCategory]?.name ?? 'Vendor'} · {formatDate(thread.date)}
          </span>
        </div>
        <span className="tag">{thread.topic}</span>
      </div>
      <h3>{thread.title}</h3>
      <p>{thread.body}</p>
      <div className="thread-actions">
        <button className="link-button" onClick={() => likeThread(thread.id)}>
          👍 {thread.likes}
        </button>
        <button className="link-button" onClick={() => setOpen(!open)}>
          💬 {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
        </button>
      </div>
      {open && (
        <div className="replies">
          {thread.replies.map((r, i) => (
            <div key={i} className="reply">
              <strong>{r.author}</strong> <span className="muted small">· {formatDate(r.date)}</span>
              <p>{r.text}</p>
            </div>
          ))}
          <form className="input-with-button" onSubmit={submit}>
            <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" />
            <button className="btn btn-primary btn-sm">Reply</button>
          </form>
        </div>
      )}
    </article>
  )
}

export default function Community() {
  const { threads, addThread } = useStore()
  const [topic, setTopic] = useState('All')
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState({ title: '', topic: communityTopics[1], body: '' })

  const shown = threads.filter((t) => topic === 'All' || t.topic === topic)

  const submit = (e) => {
    e.preventDefault()
    addThread({ ...draft, id: Date.now(), author: 'You', authorCategory: '', date: todayISO(), replies: [], likes: 0 })
    setDraft({ title: '', topic: communityTopics[1], body: '' })
    setComposing(false)
  }

  return (
    <div className="container page">
      <div className="page-head community-head">
        <div>
          <p className="eyebrow">For vendors</p>
          <h1>Vendor community</h1>
          <p className="muted">
            Talk business with other wedding pros: find partners, pass on referrals when you're booked, compare
            pricing and share what works.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setComposing(!composing)}>
          {composing ? 'Cancel' : '+ Start a discussion'}
        </button>
      </div>

      {composing && (
        <form className="card compose" onSubmit={submit}>
          <div className="form-row">
            <label>
              <span>Title</span>
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              <span>Topic</span>
              <select value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })}>
                {communityTopics.slice(1).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Message</span>
            <textarea required rows="4" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          </label>
          <button className="btn btn-primary">Post</button>
        </form>
      )}

      <div className="category-chips">
        {communityTopics.map((t) => (
          <button key={t} className={topic === t ? 'chip active' : 'chip'} onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="thread-list">
        {shown.length ? shown.map((t) => <Thread key={t.id} thread={t} />) : <p className="muted">No discussions in this topic yet.</p>}
      </div>
    </div>
  )
}
