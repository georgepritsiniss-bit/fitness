import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { submitMessage } from '../services/api'
import { PageHeader } from '../components/ui'
import { isSupabaseConfigured } from '../services/supabase'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function validate() {
    const next: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) next.name = 'Enter your name (min 2 characters).'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email address.'
    }
    if (!message.trim() || message.trim().length < 10) {
      next.message = 'Message must be at least 10 characters.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSuccess(false)
    setFormError(null)
    if (!validate()) return
    if (!isSupabaseConfigured) {
      setFormError('Supabase is not configured.')
      return
    }
    setSubmitting(true)
    try {
      await submitMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      })
      setSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
      setErrors({})
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-app py-10">
      <PageHeader
        title="Contact"
        subtitle="Questions about programs or partnerships? Send a message."
      />

      <motion.form
        onSubmit={onSubmit}
        className="card mx-auto max-w-xl space-y-4 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        noValidate
      >
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            className="input min-h-[140px] resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.message}</p>
          )}
        </div>

        {formError && <p className="text-sm text-[var(--color-danger)]">{formError}</p>}
        {success && (
          <p className="rounded-xl bg-[var(--color-accent)]/15 px-3 py-2 text-sm text-[var(--color-accent)]">
            Message sent. We will get back to you soon.
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
        </button>
      </motion.form>
    </div>
  )
}
