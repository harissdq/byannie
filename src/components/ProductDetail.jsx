import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getProduct, getProducts, fetchProducts, addToCart, openCart, formatPKR } from '../lib/store'
import ProductCard from './ProductCard'

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1515562141589-69f0c2aa1f2d?w=800&q=80'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [magnify, setMagnify] = useState(false)
  const [magnifyPos, setMagnifyPos] = useState({ x: 50, y: 50 })
  const [adding, setAdding] = useState(false)
  const [showSpecs, setShowSpecs] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [imgLoaded, setImgLoaded] = useState(false)
  const [mobileZoom, setMobileZoom] = useState(false)
  const [pinchScale, setPinchScale] = useState(1)
  const [pinchOrigin, setPinchOrigin] = useState({ x: 50, y: 50 })
  const mainImageRef = useRef(null)
  const lastTouchDist = useRef(null)
  const lastTouchCenter = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setSelectedImage(0); setSelectedVariant(0); setImgLoaded(false)
      let p = getProduct(id)
      if (!p) { await fetchProducts(); p = getProduct(id) }
      if (!cancelled) {
        setProduct(p)
        if (p) {
          const all = getProducts()
          setRelatedProducts(all.filter(r => r.collection === p.collection && r.id !== p.id).slice(0, 4))
        }
        setLoading(false)
      }
    }
    load()
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => { cancelled = true }
  }, [id])

  const handleMouseMove = useCallback((e) => {
    if (!magnify || !mainImageRef.current) return
    const rect = mainImageRef.current.getBoundingClientRect()
    setMagnifyPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }, [magnify])

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.hypot(dx, dy)
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null && mainImageRef.current) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = Math.min(3, Math.max(1, (dist / lastTouchDist.current) * pinchScale))
      const rect = mainImageRef.current.getBoundingClientRect()
      const cx = ((lastTouchCenter.current.x - rect.left) / rect.width) * 100
      const cy = ((lastTouchCenter.current.y - rect.top) / rect.height) * 100
      setPinchScale(newScale)
      setPinchOrigin({ x: cx, y: cy })
      if (newScale > 1.1) setMobileZoom(true)
    }
  }, [pinchScale])

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      lastTouchDist.current = null
      lastTouchCenter.current = null
      if (pinchScale <= 1.1) {
        setPinchScale(1)
        setMobileZoom(false)
      }
    }
  }, [pinchScale])

  const handleMobileTapZoom = useCallback(() => {
    if (mobileZoom) {
      setMobileZoom(false)
      setPinchScale(1)
    } else {
      setMobileZoom(true)
      setPinchScale(2.2)
      setPinchOrigin({ x: 50, y: 50 })
    }
  }, [mobileZoom])

  const handleAddToCart = useCallback(() => {
    if (!product || adding) return
    setAdding(true)
    addToCart(product, product.variants?.[selectedVariant]?.label)
    openCart()
    setTimeout(() => setAdding(false), 1200)
  }, [product, selectedVariant, adding])

  const price = product?.variants?.[selectedVariant]?.price || product?.price || 0
  const discount = product?.originalPrice ? Math.round((1 - price / product.originalPrice) * 100) : 0

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-rose-pale" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose animate-spin" />
        </div>
        <p className="text-white/50 text-xs tracking-[0.25em] uppercase">Loading</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-5xl mb-1">✨</div>
      <p className="text-white text-lg font-syne">Item not found</p>
      <Link to="/" className="btn-outline-rose px-6 py-2 rounded-full text-xs tracking-[0.12em] uppercase">Return to Catalog</Link>
    </div>
  )

  const images = product.images?.length ? product.images : [IMG_FALLBACK]
  const currentImage = images[selectedImage] || IMG_FALLBACK

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Breadcrumb */}
        <motion.nav initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 text-xs text-white/50 mb-8 lg:mb-12">
          <Link to="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-rose/30">/</span>
          <Link to="/" className="hover:text-rose transition-colors truncate max-w-[120px]">{product.collection}</Link>
          <span className="text-rose/30">/</span>
          <span className="text-white truncate max-w-[180px]">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* LEFT: Gallery */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-3">
            <div ref={mainImageRef}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 border border-white/5 cursor-crosshair group"
              onMouseEnter={() => setMagnify(true)} onMouseLeave={() => setMagnify(false)} onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
              onClick={handleMobileTapZoom}
            >
              {!imgLoaded && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
              <AnimatePresence mode="wait">
                <motion.img key={selectedImage} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }} src={currentImage} alt={product.name} onLoad={() => setImgLoaded(true)} className="w-full h-full object-cover"
                  style={mobileZoom || pinchScale > 1 ? { transform: `scale(${pinchScale})`, transformOrigin: `${pinchOrigin.x}% ${pinchOrigin.y}%`, transition: 'transform 0.2s ease' } : undefined}
                />
              </AnimatePresence>
              {magnify && !mobileZoom && (
                <div className="absolute inset-0 pointer-events-none z-10"
                  style={{ backgroundImage: `url(${currentImage})`, backgroundPosition: `${magnifyPos.x}% ${magnifyPos.y}%`, backgroundSize: '250%', backgroundRepeat: 'no-repeat', borderRadius: 'inherit' }} />
              )}
              {mobileZoom && (
                <div className="absolute bottom-3 right-3 z-20 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-[9px] text-white/70 tracking-wider uppercase">
                  Tap to zoom out
                </div>
              )}
              {!mobileZoom && (
                <div className="absolute bottom-3 right-3 z-20 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-[9px] text-white/40 tracking-wider uppercase pointer-events-none hidden md:block">
                  Hover to zoom
                </div>
              )}
              {!mobileZoom && (
                <div className="absolute bottom-3 right-3 z-20 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-[9px] text-white/40 tracking-wider uppercase pointer-events-none md:hidden">
                  Tap to zoom
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-rose/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">Save {discount}%</div>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => { setSelectedImage(idx); setImgLoaded(false); setMobileZoom(false); setPinchScale(1) }}
                    className={`flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      idx === selectedImage ? 'border-rose shadow-[0_0_10px_rgba(212,145,158,0.15)]' : 'border-white/5 opacity-50 hover:opacity-80'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="flex flex-col">
            <p className="text-[10px] tracking-[0.25em] uppercase text-rose/50 mb-2 font-medium">{product.collection}</p>
            <h1 className="font-syne text-3xl sm:text-4xl text-white leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.rating || 0) ? 'text-gold' : 'text-rose-pale'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-white/50">{product.rating || 0}{product.reviews > 0 && ` (${product.reviews})`}</span>
            </div>

            <div className="flex items-baseline gap-2.5 mb-6">
              <span className="font-syne text-3xl text-rose">{formatPKR(price)}</span>
              {product.originalPrice && product.originalPrice > price && (
                <>
                  <span className="text-base text-white/50/50 line-through">{formatPKR(product.originalPrice)}</span>
                  <span className="text-[10px] text-rose bg-white/10 px-2.5 py-0.5 rounded-full font-medium">-{discount}%</span>
                </>
              )}
            </div>

            <div className="h-px bg-gradient-to-r from-rose/15 via-rose/8 to-transparent mb-6" />

            {product.description && <p className="text-white/50 leading-relaxed mb-6 text-sm">{product.description}</p>}

            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] tracking-[0.18em] uppercase text-white/50 mb-2.5 font-medium">Select Option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, idx) => (
                    <button key={v.label} onClick={() => setSelectedVariant(idx)}
                      className={`px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                        idx === selectedVariant
                          ? 'bg-white/10 text-rose border border-rose/25 shadow-[0_0_12px_rgba(212,145,158,0.06)]'
                          : 'bg-[#0a0a0a] text-white/50 border border-white/5 hover:border-rose/20'
                      }`}>
                      <span className="block">{v.label}</span>
                      {v.price !== product.price && <span className="block text-[10px] mt-0.5 opacity-60">{formatPKR(v.price)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <motion.button onClick={handleAddToCart} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full btn-rose py-4 rounded-xl text-sm tracking-[0.15em] uppercase font-medium mb-8">
              <span className="flex items-center justify-center gap-2.5">
                {adding ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Added to Bag</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>Add to Bag</>
                )}
              </span>
            </motion.button>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-5 border-t border-white/5 mb-2">
              {[{ label: 'SKU', value: product.sku }, { label: 'Weight', value: product.weight }, { label: 'Metal', value: product.metal }, { label: 'Gemstone', value: product.gemstone }]
                .filter(d => d.value).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] tracking-[0.18em] uppercase text-white/50/50 mb-0.5">{label}</p>
                  <p className="text-sm text-white">{value}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setShowSpecs(!showSpecs)} className="flex items-center justify-between w-full py-3 border-t border-white/5 text-sm text-white/50 hover:text-white transition-colors">
              <span className="tracking-[0.12em] uppercase text-[11px] font-medium">Detailed Specifications</span>
              <motion.svg animate={{ rotate: showSpecs ? 180 : 0 }} className="w-4 h-4 text-white/50/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {showSpecs && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="pb-5 space-y-2.5">
                    {[{ label: 'Collection', value: product.collection }, { label: 'Category', value: product.category }, { label: 'Metal', value: product.metal },
                      { label: 'Gemstone', value: product.gemstone }, { label: 'Weight', value: product.weight }, { label: 'SKU', value: product.sku }]
                      .filter(d => d.value).map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-white/50/60">{label}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="mt-20 lg:mt-28">
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.25em] uppercase text-rose/50 mb-2">You may also love</p>
              <h2 className="font-syne text-2xl sm:text-3xl text-white">Complete the <span className="text-rose-shimmer">Collection</span></h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map((rp) => <ProductCard key={rp.id} product={rp} />)}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
