// File: app/contact/page.js
'use client'

import { useState, useEffect } from 'react'

export default function ContactPage() {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load existing comments when the page mounts
  useEffect(() => {
    loadComments()
  }, [])

  async function loadComments() {
    try {
      const res = await fetch('/api/comments')
      const data = await res.json()
      if (data.ok) setComments(data.comments)
    } catch (err) {
      console.error('Failed to load comments', err)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) return

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Failed to submit')

      setComment('')
      await loadComments() // refresh the list
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-page py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-lora text-4xl font-semibold text-ink mb-3">Contact</h1>
          <p className="text-ink-muted">
            Leave a comment and we'll get back to you soon.
          </p>
        </div>

        {/* Comment form */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-sky/40 rounded-2xl p-6 shadow-md mb-10"
        >
          <label className="block mb-3">
            <span className="block text-sm font-semibold uppercase tracking-widest text-ink-muted mb-2">
              Your Message
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-mist border border-sky/60 text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="w-full bg-primary text-primary-contrast font-bold uppercase tracking-widest text-sm py-3 rounded-full hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>

        {/* Comment list */}
        <div>
          <h2 className="font-lora text-2xl font-semibold text-ink mb-4">
            Recent Comments
          </h2>
          {comments.length === 0 ? (
            <p className="text-ink-muted text-sm italic">No comments yet — be the first!</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="bg-surface border border-sky/30 rounded-lg p-4 shadow-sm"
                >
                  <p className="text-ink">{c.comment}</p>
                  <p className="text-xs text-ink-muted mt-2">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}