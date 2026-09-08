import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/ui'

export function RegisterPage() {
  const { signUp, configured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { error: err } = await signUp(email.trim(), password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setInfo('Account created. Check your email if confirmation is enabled, then log in.')
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <div className="container-app py-10">
      <PageHeader title="Sign up" subtitle="Create an account to save favorite workouts." />
      <motion.form
        onSubmit={onSubmit}
        className="card mx-auto max-w-md space-y-4 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!configured && (
          <p className="rounded-xl bg-[var(--color-warn)]/15 px-3 py-2 text-sm text-[var(--color-warn)]">
            Configure Supabase env vars before registering.
          </p>
        )}
        <div>
          <label className="label" htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="reg-password">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label" htmlFor="reg-confirm">
            Confirm password
          </label>
          <input
            id="reg-confirm"
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        {info && <p className="text-sm text-[var(--color-accent)]">{info}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-[var(--color-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-accent)]">
            Log in
          </Link>
        </p>
      </motion.form>
    </div>
  )
}
