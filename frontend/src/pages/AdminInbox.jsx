import { useState, useEffect, useCallback } from 'react'
import { getContacts, getContact, updateContact, deleteContact } from '../api/contacts'
import ConfirmModal from '../components/ConfirmModal'
import { useConfirm } from '../hooks/useConfirm'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminInbox() {
  const [messages, setMessages]   = useState([])
  const [meta, setMeta]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleting, setDeleting]   = useState(null)
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm()
  const [filter, setFilter]       = useState('')   // '' | 'true' | 'false'
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 12 }
      if (filter !== '') params.is_read = filter
      if (search)        params.search  = search
      const res = await getContacts(params)
      setMessages(res.data.data)
      setMeta(res.data)
    } catch {
      // silently fail — backend may not be running
    } finally {
      setLoading(false)
    }
  }, [page, filter, search])

  useEffect(() => { fetchMessages() }, [fetchMessages])
  useEffect(() => { setPage(1) }, [filter, search])

  async function openMessage(msg) {
    setDetailLoading(true)
    setSelected(null)
    try {
      const res = await getContact(msg.id)
      setSelected(res.data)
      // Optimistically mark as read in list
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m))
    } finally {
      setDetailLoading(false)
    }
  }

  async function toggleRead(msg, e) {
    e.stopPropagation()
    const next = !msg.is_read
    await updateContact(msg.id, { is_read: next })
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: next } : m))
    if (selected?.id === msg.id) setSelected((s) => ({ ...s, is_read: next }))
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    const ok = await confirm({
      title: 'Delete Message',
      message: 'Are you sure you want to permanently delete this message?',
      confirmLabel: 'Yes, Delete',
    })
    if (!ok) return
    setDeleting(id)
    try {
      await deleteContact(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      if (selected?.id === id) setSelected(null)
    } finally {
      setDeleting(null)
    }
  }

  const unread = messages.filter((m) => !m.is_read).length

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">Admin Inbox</h1>
          {unread > 0 && <span className="unread-chip">{unread} unread</span>}
        </div>
      </div>

      <div className="inbox-layout">
        {/* ── Left: message list ── */}
        <div className="inbox-list-panel">
          {/* Toolbar */}
          <div className="inbox-toolbar">
            <input
              className="filter-input search-input"
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="filter-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>

          {/* Stats */}
          {meta && (
            <div className="inbox-meta">
              {meta.total} message{meta.total !== 1 ? 's' : ''}
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="inbox-empty"><div className="spinner" /></div>
          ) : messages.length === 0 ? (
            <div className="inbox-empty">No messages found.</div>
          ) : (
            <ul className="message-list">
              {messages.map((msg) => (
                <li
                  key={msg.id}
                  className={`message-item ${!msg.is_read ? 'unread' : ''} ${selected?.id === msg.id ? 'active' : ''}`}
                  onClick={() => openMessage(msg)}
                >
                  <div className="mi-top">
                    <span className="mi-name">{msg.name}</span>
                    <span className="mi-time">{timeAgo(msg.created_at)}</span>
                  </div>
                  <div className="mi-subject">{msg.subject}</div>
                  <div className="mi-preview">{msg.message}</div>
                  <div className="mi-actions">
                    <button
                      className={`btn btn-sm ${msg.is_read ? 'btn-secondary' : 'btn-edit'}`}
                      onClick={(e) => toggleRead(msg, e)}
                      title={msg.is_read ? 'Mark unread' : 'Mark read'}
                    >
                      {msg.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={(e) => handleDelete(msg.id, e)}
                      disabled={deleting === msg.id}
                    >
                      {deleting === msg.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="inbox-pagination">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{page} / {meta.last_page}</span>
              <button className="btn btn-secondary btn-sm" disabled={page === meta.last_page} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </div>

        {/* ── Right: message detail ── */}
        <div className="inbox-detail-panel">
          {detailLoading ? (
            <div className="detail-empty"><div className="spinner" /></div>
          ) : !selected ? (
            <div className="detail-empty">
              <div className="detail-empty-icon">📬</div>
              <p>Select a message to read it</p>
            </div>
          ) : (
            <div className="message-detail">
              <div className="detail-header">
                <div>
                  <h2 className="detail-subject">{selected.subject}</h2>
                  <div className="detail-meta">
                    <span><strong>{selected.name}</strong> &lt;{selected.email}&gt;</span>
                    <span className="detail-time">{new Date(selected.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    className={`btn btn-sm ${selected.is_read ? 'btn-secondary' : 'btn-edit'}`}
                    onClick={(e) => toggleRead(selected, e)}
                  >
                    {selected.is_read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={(e) => handleDelete(selected.id, e)}
                    disabled={deleting === selected.id}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="detail-body">
                {selected.message}
              </div>

              <a
                className="btn btn-primary reply-btn"
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
              >
                ✉ Reply via Email
              </a>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmLabel={options.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  )
}
