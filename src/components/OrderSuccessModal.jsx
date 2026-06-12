import React from 'react'
import './OrderSuccessModal.css'

const BARIDI_ACCOUNT = import.meta.env.VITE_BARIDI_ACCOUNT
const BARIDI_PHONE   = import.meta.env.VITE_BARIDI_PHONE
const CONTACT_EMAIL  = import.meta.env.VITE_CONTACT_EMAIL

export default function OrderSuccessModal({ orderId, onTrack, onClose }) {
  if (!orderId) return null

  return (
    <div className="modal-overlay">
      <div className="success-modal">
        <div className="success-header">
          <span className="success-icon">✓</span>
          <h2>تم استلام طلبك</h2>
          <p>سيتم التواصل معك قريباً لتأكيد الطلب</p>
        </div>

        <div className="order-id-block">
          <span className="order-id-label">رقم الطلب</span>
          <span className="order-id-value">{orderId}</span>
          <p className="order-id-hint">احتفظ بهذا الرقم لتتبع طلبك</p>
        </div>

        <div className="payment-instructions">
          <div className="pay-inst-title">معلومات الدفع</div>

          <div className="pay-inst-row">
            <span className="pay-inst-label">بريدي موب</span>
            <span className="pay-inst-val">{BARIDI_ACCOUNT}</span>
          </div>
          <div className="pay-inst-row">
            <span className="pay-inst-label">رقم الهاتف</span>
            <span className="pay-inst-val">{BARIDI_PHONE}</span>
          </div>

          <div className="pay-inst-note">
            بعد الدفع، أرسل صورة الوصل مع رقم طلبك إلى:
            <br />
            <strong>{CONTACT_EMAIL}</strong>
          </div>
        </div>

        <div className="success-actions">
          <button className="btn btn-teal btn-full" onClick={onTrack}>
            تتبع طلبي
          </button>
          <button className="btn btn-ghost btn-full" onClick={onClose}>
            متابعة التسوق
          </button>
        </div>
      </div>
    </div>
  )
}
