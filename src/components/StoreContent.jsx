import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getProducts, on, formatPKR, fetchHeroImages } from '../lib/store'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const DEPARTMENTS = [
  { id: 'jewelry', label: 'Jewelry', icon: '✦', tagline: 'Crafted Elegance for Every Occasion' },
  { id: 'decor', label: 'Decor', icon: '◈', tagline: 'Transform Your Space' },
  { id: 'lingerie', label: 'Lingerie', icon: '❋', tagline: 'Intimate Luxury, Redefined' },
]

const DEFAULT_HERO = {
  jewelry: '/images/products/p1-gold-necklace.jpg',
  decor: '/images/products/p25-gold-vase.jpg',
  lingerie: '/images/products/p13-bathrobe.jpg',
}

function WavyLine() {
  const pathRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const path = pathRef.current
      if (!path) return
      const tension = (e.clientX / window.innerWidth) * 50
      path.setAttribute('d', `M 10 0 Q ${tension + 10} 100 10 200 T 10 400 T 10 600`)
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <svg className="absolute left-[-40px] top-0 h-full w-[20px]" preserveAspectRatio="none">
      <path
        ref={pathRef}
        d="M 10 0 Q 20 100 10 200 T 10 400 T 10 600"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        className="pearl-line"
      />
    </svg>
  )
}

function DepartmentSection({ department, products, totalCount, heroImages }) {
  const dept = DEPARTMENTS.find(d => d.id === department)
  if (!dept) return null
  const heroImage = heroImages?.[department] || DEFAULT_HERO[department]

  return (
    <section id={department === 'jewelry' ? 'pearls' : department} className="relative bg-[#050505] px-12 py-40 md:px-24">
      {/* Hero */}
      <div className="grid grid-cols-1 gap-32 lg:grid-cols-2 mb-40">
        <div>
          <h3 className="font-[Syncopate] text-4xl md:text-5xl uppercase tracking-wider mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            {dept.icon} {dept.label}
          </h3>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-12">{dept.tagline}</p>
          <div className="h-px w-24 bg-gradient-to-r from-rose to-transparent mb-12" />
          <p className="text-white/60 text-sm leading-relaxed max-w-md">
            Discover our curated {dept.label.toLowerCase()} collection — where contemporary design meets timeless craftsmanship.
            Each piece is thoughtfully created to bring beauty and elegance into your life.
          </p>
          <Link
            to={`/shop?department=${department}`}
            className="inline-flex items-center gap-2 mt-10 text-[11px] tracking-[0.2em] uppercase text-rose hover:text-rose/80 transition-colors group"
          >
            View All {dept.label}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[100px] border border-white/5 bg-[#0a0a0a]">
            <div className="absolute inset-0 bg-rose opacity-0 transition-opacity group-hover:opacity-10" />
            <motion.img
              src={heroImage}
              alt={dept.label}
              initial={{ filter: 'grayscale(100%)', scale: 1.1 }}
              whileInView={{ filter: 'grayscale(0%)', scale: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Featured Products Grid */}
      {products.length > 0 && (
        <div className="mt-40">
          <div className="mb-32 flex flex-col items-center">
            <div className="h-32 w-px bg-gradient-to-b from-transparent via-rose to-transparent" />
            <h3 className="mt-12 font-syne text-2xl uppercase tracking-[0.8em]">
              Featured
            </h3>
            <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/30">
              {products.length} pieces
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group relative flex aspect-square items-center justify-center overflow-hidden bg-[#050505]"
              >
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full scale-110 object-cover grayscale brightness-50 transition-all duration-700 group-hover:scale-100 group-hover:grayscale-0 group-hover:brightness-100"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl grayscale opacity-30 transition-all duration-700 group-hover:scale-100 group-hover:grayscale-0 group-hover:opacity-60">
                    {dept.icon}
                  </div>
                )}
                <div className="absolute inset-0 bg-rose opacity-0 transition-opacity duration-500 group-hover:opacity-10" />
                <div className="absolute bottom-10 left-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="font-syne text-xs uppercase tracking-widest">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[9px] text-rose tracking-wider">
                    {formatPKR(product.price)}
                  </p>
                  {product.stock === 0 && (
                    <p className="mt-1 text-[8px] text-red-400 uppercase tracking-wider">Sold Out</p>
                  )}
                  {product.stock > 0 && product.stock < 5 && (
                    <p className="mt-1 text-[8px] text-amber-400 uppercase tracking-wider">Low Stock</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalCount > products.length && (
            <div className="mt-16 text-center">
              <Link
                to={`/shop?department=${department}`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-rose hover:border-rose/30 transition-all"
              >
                Browse All {totalCount} {dept.label} Products
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default function StoreContent() {
  const [products, setProducts] = useState([])
  const [heroImages, setHeroImages] = useState(DEFAULT_HERO)

  useEffect(() => {
    setProducts(getProducts())
    fetchHeroImages().then(imgs => { if (imgs) setHeroImages(imgs) })
    const unsub1 = on('products-loaded', (data) => setProducts(data))
    const unsub2 = on('hero-images-updated', () => {
      fetchHeroImages().then(imgs => { if (imgs) setHeroImages(imgs) })
    })
    return () => { unsub1(); unsub2() }
  }, [])

  const productsByDept = DEPARTMENTS.map(dept => ({
    ...dept,
    featured: products.filter(p => p.department === dept.id && p.featured),
    total: products.filter(p => p.department === dept.id).length,
  }))

  return (
    <>
      {productsByDept.map(dept => (
        <DepartmentSection key={dept.id} department={dept.id} products={dept.featured} totalCount={dept.total} heroImages={heroImages} />
      ))}
    </>
  )
}
