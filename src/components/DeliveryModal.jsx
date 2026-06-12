import React, { useState } from 'react'
import { deliverOrder } from '../services/firebase'
import { useToast } from '../context/ToastContext'

export default function DeliveryModal({ order, onClose, onDelivered }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const showToast             = useToast()

  async function handleDeliver() {
    if (!content.trim()) {
      showToast('أدخل محتوى التسليم', 'error'); return
    }
    setLoading(true)
    try {
      await deliverOrder(order.docId, content.trim())
      onDelivered(order.docId, content.trim())
      showToast('✓ تم التسليم بنجاح', 'success')
      onClose()
    } catch (e) {
      showToast('خطأ: ' + e.message, 'error')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>تسليم المنتج للزبون</h2>

        <div style={{
          background: 'rgba(42,157,143,0.07)',
          border: '1px solid rgba(42,157,143,0.25)',
          borderRadius: 'var(--radius)',
          padding: '0.85rem 1rem',
          fontSize: '0.85rem',
          lineHeight: '1.7',
          color: 'var(--muted)',
          marginBottom: '1rem'
        }}>
          <strong style={{ color: 'var(--text)' }}>{order.orderId}</strong>
          <br />
          {order.buyer?.name} — {order.buyer?.phone}
          <br />
          {(order.items || []).map(i => `${i.name} ×${i.qty}`).join('، ')}
          <br />
          <strong style={{ color: 'var(--teal)' }}>
            {Number(order.total).toLocaleString('ar-DZ')} دج
          </strong>
        </div>

        <div className="field">
          <label>محتوى التسليم (حساب، رابط، كود...)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`مثال:\n📧 الإيميل: example@gmail.com\n🔑 كلمة المرور: pass123\nأو:\n🔗 الرابط: https://...\n🎮 الكود: XXXX-XXXX`}
            style={{ minHeight: '120px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-teal btn-full"
            onClick={handleDeliver}
            disabled={loading}
          >
            {loading ? 'جاري الإرسال...' : 'تسليم وإرسال للزبون ←'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  )
}
