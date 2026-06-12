import React, { useState, useEffect } from 'react'
import {
  fetchOrders, fetchProducts,
  updateOrderStatus,
  addProduct, updateProduct, deleteProduct,
} from '../services/firebase'
import { adminSignOut } from '../services/firebase'
import { useToast } from '../context/ToastContext'
import DeliveryModal from '../components/DeliveryModal'
import './AdminPage.css'

const STATUS_LABELS = {
  pending:   'انتظار',
  confirmed: 'مؤكدة',
  delivered: 'مُسلّمة',
  cancelled: 'ملغية',
}

const EMOJIS = ['🎬','🎮','🎵','📚','💻','🔑','📱','🌐','⭐','🛡️','🎁','🏆']

const CATEGORIES = ['🎬 منصات الترفيه','🎮 ألعاب','🎵 موسيقى','📚 تعليم','💻 برامج','🔑 حسابات','📱 تطبيقات','🌐 أخرى']

export default function AdminPage({ onExit }) {
  const showToast = useToast()
  const [tab, setTab]             = useState('orders')
  const [orders, setOrders]       = useState([])
  const [products, setProducts]   = useState([])
  const [orderFilter, setFilter]  = useState('all')
  const [loadingO, setLoadingO]   = useState(true)
  const [loadingP, setLoadingP]   = useState(true)
  const [deliveryOrder, setDelivery] = useState(null)

  // Product form
  const [editId, setEditId]       = useState('')
  const [pName, setPName]         = useState('')
  const [pCat, setPCat]           = useState('')
  const [pDesc, setPDesc]         = useState('')
  const [pPrice, setPPrice]       = useState('')
  const [pBadge, setPBadge]       = useState('')
  const [pEmoji, setPEmoji]       = useState('🎬')

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(e => showToast('خطأ: ' + e.message, 'error'))
      .finally(() => setLoadingO(false))

    fetchProducts()
      .then(setProducts)
      .catch(e => showToast('خطأ: ' + e.message, 'error'))
      .finally(() => setLoadingP(false))
  }, [])

  async function handleStatus(order, status) {
    try {
      await updateOrderStatus(order.docId, status)
      setOrders(prev => prev.map(o => o.docId === order.docId ? { ...o, status } : o))
      showToast('تم التحديث', 'success')
    } catch(e) { showToast('خطأ: ' + e.message, 'error') }
  }

  function handleDelivered(docId, content) {
    setOrders(prev => prev.map(o =>
      o.docId === docId ? { ...o, status: 'delivered', deliveryContent: content } : o
    ))
  }

  async function handleSaveProduct() {
    if (!pName.trim() || !pCat || !pPrice || isNaN(parseFloat(pPrice))) {
      showToast('يرجى ملء الحقول الإلزامية', 'error'); return
    }
    const data = {
      name: pName.trim(), cat: pCat, desc: pDesc.trim(),
      price: parseFloat(pPrice), badge: pBadge.trim(),
      emoji: pEmoji, active: true
    }
    try {
      if (editId) {
        await updateProduct(editId, data)
        setProducts(prev => prev.map(p => p.id === editId ? { id: editId, ...data } : p))
        showToast('تم تعديل المنتج', 'success')
      } else {
        const np = await addProduct(data)
        setProducts(prev => [...prev, np])
        showToast('تم إضافة المنتج', 'success')
      }
      resetForm()
    } catch(e) { showToast('خطأ: ' + e.message, 'error') }
  }

  async function handleDeleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      showToast('تم الحذف', 'success')
    } catch(e) { showToast('خطأ: ' + e.message, 'error') }
  }

  function startEdit(p) {
    setEditId(p.id); setPName(p.name); setPCat(p.cat)
    setPDesc(p.desc || ''); setPPrice(p.price); setPBadge(p.badge || '')
    setPEmoji(p.emoji || '🎬')
  }

  function resetForm() {
    setEditId(''); setPName(''); setPCat(''); setPDesc(''); setPPrice('')
    setPBadge(''); setPEmoji('🎬')
  }

  async function handleSignOut() {
    await adminSignOut()
    onExit()
  }

  const filtered = orderFilter === 'all'
    ? orders
    : orders.filter(o => o.status === orderFilter)

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue:   orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + (Number(o.total)||0), 0),
  }

  return (
    <div className="admin-page">
      {/* Admin nav */}
      <div className="admin-nav">
        <div className="admin-nav-inner">
          <div className="admin-brand">لوحة التحكم</div>
          <div className="admin-tabs">
            {[['orders','الطلبيات'],['products','المنتجات'],['stats','الإحصائيات']].map(([key, lbl]) => (
              <button
                key={key}
                className={`admin-tab ${tab === key ? 'admin-tab-active' : ''}`}
                onClick={() => setTab(key)}
              >
                {lbl}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
            خروج ←
          </button>
        </div>
      </div>

      <div className="admin-container">
        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <div className="section-title">إدارة الطلبيات</div>

            <div className="filter-bar">
              {['all', ...Object.keys(STATUS_LABELS)].map(s => (
                <button
                  key={s}
                  className={`filter-pill ${orderFilter === s ? 'filter-pill-active' : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {s === 'all' ? 'الكل' : STATUS_LABELS[s]}
                  {s !== 'all' && (
                    <span className="filter-count">
                      {orders.filter(o => o.status === s).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loadingO ? (
              <div className="loading-row"><div className="spinner" /> جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div className="admin-empty">لا توجد طلبيات</div>
            ) : (
              <div className="orders-list">
                {filtered.map(order => (
                  <div key={order.docId} className="order-card">
                    <div className="order-card-top">
                      <div>
                        <div className="order-number">{order.orderId}</div>
                        <div className="order-buyer">{order.buyer?.name}</div>
                      </div>
                      <span className={`status-pill pill-${order.status}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>

                    <div className="order-meta">
                      <span>📞 {order.buyer?.phone}</span>
                      <span>📍 {order.buyer?.wilaya}</span>
                      <span>{order.payment === 'flexi' ? '💳 فليكسي' : '📮 بريدي'}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</span>
                    </div>

                    <div className="order-items-row">
                      {(order.items || []).map((i,idx) => (
                        <span key={idx} className="order-item-tag">
                          {i.emoji} {i.name} ×{i.qty}
                        </span>
                      ))}
                    </div>

                    <div className="order-footer">
                      <span className="order-total">
                        {Number(order.total).toLocaleString('ar-DZ')} دج
                      </span>
                      <div className="order-actions">
                        {order.status === 'pending' && (
                          <button className="btn btn-teal btn-sm" onClick={() => handleStatus(order, 'confirmed')}>
                            تأكيد
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button className="btn btn-teal btn-sm" onClick={() => setDelivery(order)}>
                            تسليم المنتج
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(order, 'cancelled')}>
                            إلغاء
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--teal)' }}>✓ تم التسليم</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <div className="products-manager">
            {/* List */}
            <div className="products-panel">
              <div className="section-title">المنتجات الحالية</div>
              {loadingP ? (
                <div className="loading-row"><div className="spinner" /></div>
              ) : products.length === 0 ? (
                <div className="admin-empty">لا توجد منتجات — أضف أول منتج</div>
              ) : (
                <div className="admin-product-list">
                  {products.map(p => (
                    <div key={p.id} className="admin-product-item">
                      <span className="admin-product-emoji">{p.emoji || '📦'}</span>
                      <div className="admin-product-info">
                        <div className="admin-product-name">{p.name}</div>
                        <div className="admin-product-meta">
                          {p.cat} — {Number(p.price).toLocaleString('ar-DZ')} دج
                        </div>
                      </div>
                      <div className="admin-product-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>تعديل</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p.id)}>حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form */}
            <div className="product-form-panel">
              <div className="section-title">
                {editId ? 'تعديل المنتج' : 'إضافة منتج'}
              </div>

              <div className="field">
                <label>اسم المنتج *</label>
                <input type="text" value={pName} onChange={e => setPName(e.target.value)} placeholder="مثل: باقة نتفليكس شهر" />
              </div>

              <div className="field">
                <label>الفئة *</label>
                <select value={pCat} onChange={e => setPCat(e.target.value)}>
                  <option value="">اختر فئة</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="field">
                <label>الوصف</label>
                <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="وصف قصير..." />
              </div>

              <div className="field">
                <label>السعر (دج) *</label>
                <input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="500" />
              </div>

              <div className="field">
                <label>الأيقونة</label>
                <div className="emoji-grid">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      className={`emoji-opt ${pEmoji === e ? 'emoji-opt-active' : ''}`}
                      onClick={() => setPEmoji(e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>الشارة (اختياري)</label>
                <input type="text" value={pBadge} onChange={e => setPBadge(e.target.value)} placeholder="مثل: الأكثر مبيعاً" />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-accent btn-full" onClick={handleSaveProduct}>
                  {editId ? 'حفظ التعديل' : 'إضافة المنتج'}
                </button>
                {editId && (
                  <button className="btn btn-ghost" onClick={resetForm}>إلغاء</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <div>
            <div className="section-title">الإحصائيات</div>
            <div className="stats-grid">
              {[
                { label: 'إجمالي الطلبيات',  value: stats.total,     color: 'var(--text)' },
                { label: 'في الانتظار',       value: stats.pending,   color: 'var(--accent)' },
                { label: 'مؤكدة',            value: stats.confirmed, color: 'var(--teal)' },
                { label: 'مُسلَّمة',          value: stats.delivered, color: 'var(--teal)' },
                { label: 'عدد المنتجات',     value: products.length, color: 'var(--text)' },
                { label: 'إجمالي الإيرادات', value: stats.revenue.toLocaleString('ar-DZ') + ' دج', color: 'var(--teal)' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {deliveryOrder && (
        <DeliveryModal
          order={deliveryOrder}
          onClose={() => setDelivery(null)}
          onDelivered={handleDelivered}
        />
      )}
    </div>
  )
}
