import React from 'react'
import './ProductCard.css'

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="product-card" onClick={() => onAdd(product)}>
      <div className="product-card-top">
        <span className="product-emoji">{product.emoji || '📦'}</span>
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-cat">{product.cat || ''}</div>
        <h3 className="product-name">{product.name}</h3>
        {product.desc && (
          <p className="product-desc">{product.desc}</p>
        )}
        <div className="product-footer">
          <span className="product-price">
            {Number(product.price).toLocaleString('ar-DZ')}
            <span className="price-unit"> دج</span>
          </span>
          <button
            className="btn btn-accent btn-add"
            onClick={(e) => { e.stopPropagation(); onAdd(product) }}
          >
            + أضف
          </button>
        </div>
      </div>
    </div>
  )
}
