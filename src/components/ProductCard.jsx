import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { addToCart, openCart, formatPKR } from '../lib/store'

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1515562141589-69f0c2aa1f2d?w=600&q=80'

export default function ProductCard({ product }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (adding) return
    setAdding(true)
    addToCart(product)
    openCart()
    setTimeout(() => setAdding(false), 1200)
  }, [adding, product])

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const imageSrc = imgError ? IMG_FALLBACK : (product.images?.[0] || product.image || IMG_FALLBACK)

  return (
    <Link to={`/product/${product.id}`} className="group block relative perspective-container">
      <div className="product-3d rounded-2xl overflow-hidden border border-white/5 hover:border-rose/20 transition-all duration-500 hover:shadow-[0_16px_48px_rgba(197,125,142,0.1)] bg-[#0a0a0a]/80">

        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(212,145,158,0.06), transparent)' }} />
            </div>
          )}

          <motion.img
            src={imageSrc}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => !imgError && setImgError(true)}
            initial={{ filter: 'grayscale(100%)' }}
            whileInView={{ filter: 'grayscale(0%)' }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`product-image w-full h-full object-cover transition-transform duration-600 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />

          <div className="product-overlay absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none" />

          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-rose/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider shadow-sm">
                -{discount}%
              </div>
            </div>
          )}

          {product.rating > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <div className="glass-white flex items-center gap-1 px-2 py-1 rounded-full">
                <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] text-white font-medium">{product.rating}</span>
              </div>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider shadow-sm">
                Sold Out
              </div>
            </div>
          )}
          {product.stock > 0 && product.stock < 5 && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider shadow-sm">
                Low Stock
              </div>
            </div>
          )}

          <motion.button
            onClick={handleAddToCart}
            initial={false}
            animate={adding ? { scale: [1, 1.05, 1] } : {}}
            className="absolute bottom-0 left-0 right-0 z-10 p-4 pt-10 bg-gradient-to-t from-white/80 via-white/40 to-transparent
              translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out flex justify-center"
          >
            <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] tracking-[0.12em] uppercase font-medium transition-all duration-300 ${
              adding
                ? 'bg-gold/10 text-gold border border-gold/25'
                : 'bg-rose/10 text-rose border border-rose/20 hover:bg-rose hover:text-white hover:border-rose'
            }`}>
              {adding ? (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Added</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Quick Add</>
              )}
            </span>
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.collection && (
            <p className="text-[10px] tracking-[0.2em] uppercase text-rose/60 mb-1 font-medium">{product.collection}</p>
          )}
          <h3 className="font-syne text-base text-white group-hover:text-rose transition-colors duration-300 mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-xs text-white/50 mb-2.5 truncate">
            {product.department === 'jewelry'
              ? <>{product.metal}{product.metal && product.gemstone ? ' · ' : ''}{product.gemstone}</>
              : product.material || product.collection
            }
          </p>
          <div className="flex items-center gap-2">
            <span className="text-rose font-medium text-sm">{formatPKR(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-white/50/50 text-xs line-through">{formatPKR(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
