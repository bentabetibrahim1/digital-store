import React, { useState, useEffect, useRef } from 'react'
import { watchOrder } from '../services/firebase'
import { useToast } from '../context/ToastContext'
import './TrackingPage.css'

const STATUS_INFO = {
  pending:   { label: 'قيد المراجعة',  step: 0, color: 'var(--accent)' },
  confirmed: { label: 'تم التأكيد',    step: 1, color: 'var(--teal)' },
  delivered: { label: 'تم التسليم',    step: 2, color: 'var(--teal)' },
  cancelled: { label: 'ملغي',          step: -1, color: 'var(--danger)' },
}

export default function TrackingPage({ onBack }) {
  const [input, setInput]         = useState('')
  const [order, setOrder]         = useState(null)
  const [notFound, setNotFound]   = useState(false)
  const [searching, setSearching] = useState(false)
  const [copied, setCopied]       = useState(false)
  const showToast                 = useToast()
  const unsubRef                  = useRef(null)

  // Pre-fill last order id
  useEffect(() => {
    const last = localStorage.getItem('last_order_id')
    if (last) setInput(last)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { if (unsubRef.current) unsubRef.current() }, [])

  function search() {
    const id = input.trim().toUpperCase()
    if (!id) { showToast('أدخل رقم الطلب', 'error'); return }

    setSearching(true)
    setNotFound(false)
    setOrder(null)

    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }

    unsubRef.current = watchOrder(id, (found) => {
      setSearching(false)
      if (!found) { setNotFound(true) }
      else        { setOrder(found); setNotFound(false) }
    })
  }

  async function copyDelivery() {
    if (!order?.deliveryContent) return
    await navigator.clipboard.writeText(order.deliveryContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const s = order ? (STATUS_INFO[order.status] || STATUS_INFO.pending) : null

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <button className="btn btn-ghost tracking-back" onClick={onBack}>
          ← العودة للمتجر
        </button>

        <h1 className="tracking-title">تتبع طلبك</h1>
        <p className="tracking-sub">أدخل رقم الطلب الذي وصلك بعد الشراء</p>

        <div className="tracking-search">
          <input
            className="tracking-input"
            type="text"
            placeholder="ORD-XXXXXXXX"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button className="btn btn-accent" onClick={search} disabled={searching}>
            {searching ? '...' : 'بحث'}
          </button>
        </div>

        {notFound && (
          <div className="tracking-not-found">
            لم يُعثر على طلب بهذا الرقم
          </div>
        )}

        {order && (
          <div className="track-result">
            {/* Status banner */}
            <div className="track-status-banner" style={{ borderColor: s.color }}>
              <span className="track-status-label" style={{ color: s.color }}>
                {s.label}
              </span>
              <span className="track-status-id">{order.orderId}</span>
            </div>

            {/* Timeline */}
            {order.status !== 'cancelled' && (
              <div className="track-timeline">
                {['تم الطلب', 'مؤكد', 'مُسلَّم'].map((lbl, i) => (
                  <div
                    key={i}
                    className={`timeline-step ${
                      i < s.step ? 'done' : i === s.step ? 'current' : ''
                    }`}
                  >
                    <div className="timeline-dot" />
                    {i < 2 && <div className="timeline-line" />}
                    <div className="timeline-lbl">{lbl}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Info rows */}
            <div className="track-info-grid">
              <div className="track-info-block">
                <div className="track-info-label">بيانات الزبون</div>
                <div className="track-info-val">
                  {order.buyer?.name} — {order.buyer?.phone}
                  <br />
                  {order.buyer?.wilaya}
                </div>
              </div>
              <div className="track-info-block">
                <div className="track-info-label">ملخص الدفع</div>
                <div className="track-info-val">
                  {order.payment === 'flexi' ? 'فليكسي' : 'بريدي موب'}
                  <br />
                  <strong style={{ color: 'var(--teal)' }}>
                    {Number(order.total).toLocaleString('ar-DZ')} دج
                  </strong>
                </div>
              </div>
            </div>

            <div className="track-info-block">
              <div className="track-info-label">المنتجات</div>
              <div className="track-info-val">
                {(order.items || []).map((item, i) => (
                  <div key={i}>
                    {item.emoji} {item.name} × {item.qty} —{' '}
                    {(item.price * item.qty).toLocaleString('ar-DZ')} دج
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery content */}
            {order.status === 'delivered' && order.deliveryContent && (
              <div className="track-delivery-box">
                <div className="track-info-label">منتجك جاهز ✓</div>
                <pre className="delivery-content">{order.deliveryContent}</pre>
                <button className="btn btn-teal" onClick={copyDelivery}>
                  {copied ? 'تم النسخ ✓' : 'نسخ المحتوى'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
