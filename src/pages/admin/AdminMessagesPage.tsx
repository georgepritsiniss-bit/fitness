import { useEffect, useState } from 'react'
import { deleteMessage, fetchMessages } from '../../services/api'
import type { Message } from '../../types'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../../components/ui'

export function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setMessages(await fetchMessages())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onDelete(id: string) {
    if (!confirm('Delete this message?')) return
    try {
      await deleteMessage(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader title="Messages" subtitle="Contact form submissions." />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {!loading && !error && messages.length === 0 && (
        <EmptyState title="No messages yet." />
      )}
      {!loading && !error && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((m) => (
            <article key={m.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold">{m.name}</h3>
                  <p className="text-sm text-[var(--color-accent)]">{m.email}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <button type="button" className="btn-danger !py-1.5 !text-xs" onClick={() => void onDelete(m.id)}>
                  Delete
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--color-muted)]">{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
