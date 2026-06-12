import React, { useEffect, useState } from 'react'
import { fetchProducts } from '../services/firebase'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/ProductCard'
import './StorePage.css'

export default function StorePage({ storeName }) {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [category, setCategory]       = useState('all')
  const { addToCart, setIsOpen }      = useCart()
  const showToast                     = useToast()

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => showToast('خطأ في تحميل المنتجات: ' + e.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...new Set(products.map((p) => p.cat).filter(Boolean))]

  const filtered =
    category === 'all'
      ? products
      : products.filter((p) => p.cat === category)

  function handleAddToCart(product) {
    addToCart(product)
    showToast(`تمت الإضافة: ${product.name}`, 'success')
    setIsOpen(true)
  }

  return (
    <div className="store-page">
      {/* Hero */}
      <div className="store-hero">
        <div className="store-hero-inner">
          <div className="store-hero-eyebrow">المنتجات الرقمية</div>
          <h1 className="store-hero-title">{storeName}</h1>
          <p className="store-hero-sub">
            دفع آمن عبر بريدي موب أو فليكسي — تسليم فوري بعد التأكيد
          </p>
        </div>
      </div>

      <div className="store-container">
        {/* Categories */}
        <div className="categories-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${category === cat ? 'cat-pill-active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'all' ? 'الكل' : cat}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="products-header">
          <div className="section-title">
            {category === 'all' ? 'جميع المنتجات' : category}
          </div>
          <span className="products-count">{filtered.length} منتج</span>
        </div>

        {loading ? (
          <div className="loading-row">
            <div className="spinner" />
            جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="products-empty">
            لا توجد منتجات في هذه الفئة حالياً
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
