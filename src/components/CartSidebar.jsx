import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { placeOrder } from '../services/firebase'
import './CartSidebar.css'

const FLEXI_FEE = 0.2

export default function CartSidebar({ onOrderPlaced }) {
  const { cart, isOpen, setIsOpen, updateQty, removeFromCart, clearCart } = useCart()
  const showToast = useToast()

  const [payment, setPayment] = useState('baridi')
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [wilaya, setWilaya]   = useState('')
  const [loading, setLoading] = useState(false)

  // Restore saved buyer info
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = JSON.parse(localStorage.getItem('buyer_info') || '{}')
        if (saved.name)   setName(saved.name)
        if (saved.phone)  setPhone(saved.phone)
        if (saved.wilaya) setWilaya(saved.wilaya)
      } catch {}
    }
  }, [isOpen])

  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const fee       = payment === 'flexi' ? Math.round(subtotal * FLEXI_FEE) : 0
  const total     = subtotal + fee

  async function handlePlaceOrder() {
    if (!name.trim() || !phone.trim() || !wilaya.trim()) {
      showToast('يرجى ملء بيانات المشتري كاملة', 'error'); return
    }
    if (cart.length === 0) {
      showToast('السلة فارغة', 'error'); return
    }

    setLoading(true)
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase()
    const orderData = {
      orderId,
      buyer: { name: name.trim(), phone: phone.trim(), wilaya: wilaya.trim() },
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, emoji: i.emoji || '📦' })),
      payment,
      subtotal, fee, total,
      status: 'pending',
      deliveryContent: '',
      deliveredAt: null,
      createdAt: new Date().toISOString(),
    }

    try {
      await placeOrder(orderData)
      localStorage.setItem('buyer_info', JSON.stringify({ name: name.trim(), phone: phone.trim(), wilaya: wilaya.trim() }))
      localStorage.setItem('last_order_id', orderId)
      clearCart()
      setIsOpen(false)
      onOrderPlaced(orderId)
    } catch (e) {
      showToast('خطأ في إرسال الطلب: ' + e.message, 'error')
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsOpen(false)} />
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>سلة التسوق</h2>
          <button className="btn btn-ghost btn-close-cart" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🛒</span>
              <p>سلتك فارغة حالياً</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <span className="cart-item-emoji">{item.emoji || '📦'}</span>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    {(item.price * item.qty).toLocaleString('ar-DZ')} دج
                  </div>
                </div>
                <div className="cart-qty">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, +1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-checkout">
            {/* Payment method */}
            <div className="checkout-section">
              <div className="checkout-label">طريقة الدفع</div>
              <div className="payment-options">
                <button
                  className={`pay-opt ${payment === 'baridi' ? 'pay-opt-active-baridi' : ''}`}
                  onClick={() => setPayment('baridi')}
                >
                  <span className="pay-opt-icon">📮</span>
                  <span className="pay-opt-name">بريدي موب</span>
                  <span className="pay-opt-note">السعر العادي</span>
                </button>
                <button
                  className={`pay-opt ${payment === 'flexi' ? 'pay-opt-active-flexi' : ''}`}
                  onClick={() => setPayment('flexi')}
                >
                  <span className="pay-opt-icon">💳</span>
                  <span className="pay-opt-name">فليكسي</span>
                  <span className="pay-opt-note">+20% رسوم</span>
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="checkout-section totals">
              <div className="total-row">
                <span>المجموع الأصلي</span>
                <span>{subtotal.toLocaleString('ar-DZ')} دج</span>
              </div>
              {fee > 0 && (
                <div className="total-row total-fee">
                  <span>رسوم فليكسي (+20%)</span>
                  <span>{fee.toLocaleString('ar-DZ')} دج</span>
                </div>
              )}
              <div className="total-row total-main">
                <span>المجموع الكلي</span>
                <span>{total.toLocaleString('ar-DZ')} دج</span>
              </div>
            </div>

            {/* Buyer info */}
            <div className="checkout-section">
              <div className="checkout-label">بيانات المشتري</div>
              <input
                className="checkout-input"
                type="text"
                placeholder="الاسم الكامل *"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                className="checkout-input"
                type="tel"
                placeholder="رقم الهاتف *"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <input
                className="checkout-input"
                type="text"
                placeholder="الولاية *"
                value={wilaya}
                onChange={e => setWilaya(e.target.value)}
              />
            </div>

            <button
              className="btn btn-accent btn-full btn-lg btn-order"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'جاري الإرسال...' : 'تأكيد الطلب ←'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
