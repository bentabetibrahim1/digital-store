import React, { useState } from 'react'
import { adminSignIn } from '../services/firebase'
import { useToast } from '../context/ToastContext'

export default function AdminLogin({ onSuccess, onClose }) {
  const [email, setEmail]     = useState(import.meta.env.VITE_ADMIN_EMAIL || '')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const showToast             = useToast()

  async function handleLogin() {
    if (!email || !password) {
      showToast('أدخل البريد وكلمة المرور', 'error'); return
    }
    setLoading(true)
    try {
      await adminSignIn(email, password)
      onSuccess()
    } catch (e) {
      showToast('بيانات خاطئة: ' + e.message, 'error')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 style={{ color: 'var(--accent)' }}>دخول لوحة التحكم</h2>

        <div className="field">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@yourstore.com"
          />
        </div>

        <div className="field">
          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
          <button
            className="btn btn-accent btn-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  )
}
