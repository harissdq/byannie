import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { getProducts, searchProducts, on } from '../lib/store'
import ProductCard from './ProductCard'

const DEPARTMENTS = [
  { id: 'all', label: 'All' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'decor', label: 'Decor' },
  { id: 'lingerie', label: 'Lingerie' },
]

const JEWELRY_COLLECTIONS = ['Bridal', 'Traditional', 'Casual', 'Hand', 'Footwear']
const JEWELRY_METALS = ['Gold Plated', 'Silver Plated', 'Rose Gold Plated', 'Glass with Gold Foil']
const JEWELRY_GEMSTONES = ['Zircon', 'Pearl', 'Kundan', 'Crystal', 'Pearl & Crystal', 'Polki', 'Emerald', 'None']
const JEWELRY_CATEGORIES = ['Necklace Sets', 'Ear Tops', 'Rings', 'Bangles', 'Nose Pins & Tikka', 'Hand Jewelry', 'Payal & Foot']

const DECOR_COLLECTIONS = ['Luxury', 'Romance', 'Modern', 'Royal', 'Bohemian']
const DECOR_MATERIALS = ['Crystal & Gold', 'Pearl & LED', 'Ceramic & Rose Gold', 'Velvet & Gold Thread', 'Mirror & Glass', 'Cotton & Jute', 'Wood', 'Metal', 'Glass', 'Paper & Fabric']
const DECOR_CATEGORIES = ['Candles & Holders', 'Lighting', 'Vases', 'Textiles', 'Wall Art', 'Mirrors', 'Storage', 'Figurines']

const LINGERIE_COLLECTIONS = ['Elegance', 'Romance', 'Luxury', 'Comfort']
const LINGERIE_MATERIALS = ['Silk & Lace', 'Lace & Satin', 'Satin', 'Tulle & Embroidery', 'Lace', 'Mulberry Silk', 'Cotton', 'Mesh', 'Chiffon']
const LINGERIE_CATEGORIES = ['Chemises', 'Bralettes', 'Robes', 'Bodysuits', 'Sets', 'Sleepwear', 'Nightwear', 'Accessories']

const PRICE_RANGES = [
  { label: 'Under Rs. 500', min: 0, max: 500 },
  { label: 'Rs. 500 - 1,500', min: 500, max: 1500 },
  { label: 'Rs. 1,500 - 3,000', min: 1500, max: 3000 },
  { label: 'Rs. 3,000 - 5,000', min: 3000, max: 5000 },
  { label: 'Over Rs. 5,000', min: 5000, max: Infinity },
]

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name: A to Z' },
]

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDepartment, setActiveDepartment] = useState(searchParams.get('department') || 'all')
  const [activeCollection, setActiveCollection] = useState('all')
  const [filters, setFilters] = useState({ categories: [], priceRange: null, material: '' })
  const [sortBy, setSortBy] = useState('featured')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    setProducts(getProducts())
    const unsub = on('products-loaded', (data) => setProducts(data))
    return unsub
  }, [])

  useEffect(() => {
    const dept = searchParams.get('department')
    if (dept && DEPARTMENTS.find(d => d.id === dept)) {
      setActiveDepartment(dept)
    }
  }, [searchParams])

  useEffect(() => {
    if (!openDropdown) return
    const handler = (e) => { if (sectionRef.current && !e.target.closest('[data-dropdown]')) setOpenDropdown(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openDropdown])

  const departmentConfig = useMemo(() => {
    switch (activeDepartment) {
      case 'decor':
        return { collections: DECOR_COLLECTIONS, materials: DECOR_MATERIALS, categories: DECOR_CATEGORIES, hasMaterial: true, hasGemstone: false, hasMetal: false }
      case 'lingerie':
        return { collections: LINGERIE_COLLECTIONS, materials: LINGERIE_MATERIALS, categories: LINGERIE_CATEGORIES, hasMaterial: true, hasGemstone: false, hasMetal: false }
      default:
        return { collections: JEWELRY_COLLECTIONS, materials: [], categories: JEWELRY_CATEGORIES, hasMaterial: false, hasGemstone: true, hasMetal: true }
    }
  }, [activeDepartment])

  const collections = useMemo(() => {
    return ['all', ...departmentConfig.collections]
  }, [departmentConfig])

  const filteredProducts = useMemo(() => {
    let result = searchQuery ? searchProducts(searchQuery) : [...products]

    if (activeDepartment !== 'all') {
      result = result.filter(p => p.department === activeDepartment)
    }

    if (activeCollection !== 'all') {
      result = result.filter(p => p.collection?.toLowerCase() === activeCollection.toLowerCase())
    }

    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category))
    }

    if (filters.material) {
      result = result.filter(p => p.material === filters.material)
    }

    if (filters.priceRange) {
      const { min, max } = filters.priceRange
      result = result.filter(p => p.price >= min && p.price <= max)
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
      case 'newest': result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break
      case 'name': result.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
    }
    return result
  }, [products, searchQuery, activeDepartment, activeCollection, filters, sortBy])

  const handleDepartmentChange = (dept) => {
    setActiveDepartment(dept)
    setActiveCollection('all')
    setFilters({ categories: [], priceRange: null, material: '' })
    if (dept === 'all') {
      searchParams.delete('department')
    } else {
      searchParams.set('department', dept)
    }
    setSearchParams(searchParams)
  }

  const toggleCategory = (cat) => {
    setFilters(prev => {
      const arr = [...prev.categories]
      const idx = arr.indexOf(cat)
      if (idx >= 0) arr.splice(idx, 1); else arr.push(cat)
      return { ...prev, categories: arr }
    })
  }

  const clearAll = () => {
    setFilters({ categories: [], priceRange: null, material: '' })
    setSearchQuery('')
    setActiveCollection('all')
    setSortBy('featured')
  }

  const activeFilterCount = filters.categories.length + (filters.priceRange ? 1 : 0) + (filters.material ? 1 : 0)

  return (
    <div ref={sectionRef} className="min-h-screen bg-[#050505] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center mb-10 lg:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-rose border border-rose/15 px-4 py-1.5 rounded-full bg-white/5 mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose/50 animate-pulse" />
            {activeDepartment === 'all' ? 'All Products' : DEPARTMENTS.find(d => d.id === activeDepartment)?.label}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-syne text-white mb-3"
          >
            Shop Our <span className="text-rose-shimmer">Collection</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/50 font-light max-w-lg mx-auto text-sm sm:text-base"
          >
            Browse through our curated selection of premium jewelry, decor, and lingerie.
          </motion.p>
        </div>

        {/* Department Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="flex justify-center gap-2 mb-8">
          {DEPARTMENTS.map((dept) => (
            <button key={dept.id} onClick={() => handleDepartmentChange(dept.id)}
              className={`relative px-5 py-2 rounded-full text-[11px] tracking-[0.12em] uppercase font-medium transition-all duration-300 ${
                activeDepartment === dept.id ? 'text-white' : 'text-white/50 border border-white/10 hover:border-rose/20 hover:text-white'
              }`}>
              {activeDepartment === dept.id && (
                <motion.div layoutId="deptPill" className="absolute inset-0 bg-gradient-to-r from-rose to-rose-deep rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10">{dept.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-7 max-w-lg mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/5 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-400" />
            <div className="relative flex items-center">
              <svg className="absolute left-4 w-[18px] h-[18px] text-rose/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, collection, material..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-[#0a0a0a]/70 border border-white/10 rounded-full text-sm text-white placeholder-white/30 focus:border-rose/25 focus:bg-[#0a0a0a] transition-all duration-300"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-rose hover:bg-white/15 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Collection Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="flex flex-wrap justify-center gap-2 mb-7">
          {collections.map((col) => (
            <button key={col} onClick={() => setActiveCollection(col)}
              className={`relative px-4 py-1.5 rounded-full text-[11px] tracking-[0.12em] uppercase font-medium transition-all duration-300 ${
                activeCollection === col ? 'text-white' : 'text-white/50 border border-white/10 hover:border-rose/20 hover:text-white'
              }`}>
              {activeCollection === col && (
                <motion.div layoutId="colPill" className="absolute inset-0 bg-gradient-to-r from-rose/80 to-rose-deep/80 rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10">{col === 'all' ? 'All' : col}</span>
            </button>
          ))}
        </motion.div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7 pb-7 border-b border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <FilterDropdown
              label="Category"
              items={departmentConfig.categories}
              selected={filters.categories}
              onToggle={toggleCategory}
              isOpen={openDropdown === 'category'}
              onOpen={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
            />

            {/* Material Filter (decor/lingerie) */}
            {departmentConfig.hasMaterial && (
              <FilterDropdown
                label="Material"
                items={departmentConfig.materials}
                selected={filters.material ? [filters.material] : []}
                onToggle={(v) => setFilters(prev => ({ ...prev, material: prev.material === v ? '' : v }))}
                isOpen={openDropdown === 'material'}
                onOpen={() => setOpenDropdown(openDropdown === 'material' ? null : 'material')}
                single
              />
            )}

            {/* Price Filter */}
            <div className="relative" data-dropdown>
              <button onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] tracking-wider border transition-all duration-300 ${
                  filters.priceRange ? 'border-rose/30 text-rose bg-white/5' : 'border-white/10 text-white/50 hover:border-rose/20'
                }`}>
                Price {filters.priceRange && <span className="bg-rose/15 text-rose text-[9px] px-1.5 py-0.5 rounded-full font-semibold">1</span>}
                <svg className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'price' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <AnimatePresence>
                {openDropdown === 'price' && (
                  <motion.div initial={{ opacity: 0, y: 5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.97 }} transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 z-30 w-52 bg-[#0a0a0a] border border-white/10 rounded-xl p-1 shadow-lg shadow-rose/5">
                    {PRICE_RANGES.map((range) => (
                      <button key={range.label} onClick={() => { setFilters(prev => ({ ...prev, priceRange: prev.priceRange?.min === range.min ? null : range })); setOpenDropdown(null) }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          filters.priceRange?.min === range.min ? 'bg-white/10 text-rose font-medium' : 'text-white/50 hover:bg-white/5'
                        }`}>{range.label}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {activeFilterCount > 0 && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-rose hover:text-rose border border-rose/15 hover:border-rose/30 transition-all duration-300">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear ({activeFilterCount})
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/30 tracking-wider">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="text-[11px] tracking-wider bg-[#0a0a0a] border border-white/10 rounded-full px-3 py-1.5 text-white/50 focus:border-rose/25 cursor-pointer appearance-none pr-7"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' stroke='%238A7888' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div key={`${activeDepartment}-${activeCollection}-${JSON.stringify(filters)}-${sortBy}-${searchQuery}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {filteredProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-rose/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="font-syne text-xl text-white mb-2">No products found</h3>
                <p className="text-sm text-white/50 mb-5 max-w-xs mx-auto">Try adjusting your filters or browse a different department.</p>
                <button onClick={clearAll} className="btn-outline-rose px-6 py-2 rounded-full text-xs tracking-[0.12em] uppercase">Clear Filters</button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {filteredProducts.map((product, idx) => (
                  <motion.div key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(idx * 0.04, 0.4), duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function FilterDropdown({ label, items, selected, onToggle, isOpen, onOpen, single }) {
  return (
    <div className="relative" data-dropdown>
      <button onClick={onOpen}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] tracking-wider border transition-all duration-300 ${
          selected.length > 0 ? 'border-rose/30 text-rose bg-white/5' : 'border-white/10 text-white/50 hover:border-rose/20'
        }`}>
        {label}
        {selected.length > 0 && <span className="bg-rose/15 text-rose text-[9px] px-1.5 py-0.5 rounded-full font-semibold">{selected.length}</span>}
        <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.97 }} transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 z-30 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl p-1 shadow-lg shadow-rose/5 max-h-72 overflow-y-auto scrollbar-none">
            {items.map((item) => (
              <button key={item} onClick={() => onToggle(item)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                  selected.includes(item) ? 'bg-white/10 text-rose font-medium' : 'text-white/50 hover:bg-white/5'
                }`}>
                <span className="truncate">{item}</span>
                {selected.includes(item) && <svg className="w-3.5 h-3.5 text-rose flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
