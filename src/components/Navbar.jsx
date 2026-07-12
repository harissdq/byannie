import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { getCartCount, openCart, on, getSettings } from '../lib/store'

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [settings, setSettings] = useState({})
  const location = useLocation()

  useEffect(() => {
    setCartCount(getCartCount())
    setSettings(getSettings())
    const unsub1 = on('cart-updated', () => setCartCount(getCartCount()))
    const unsub2 = on('settings-updated', (s) => setSettings(s))
    return () => { unsub1(); unsub2() }
  }, [])

  useEffect(() => setMobileMenu(false), [location.pathname])

  const scrollToSection = (targetId = 'catalog') => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header className="pointer-events-none fixed left-0 top-0 z-[100] flex w-full items-start justify-between p-10">
        {/* Left: Brand */}
        <div className="pointer-events-auto">
          <Link to="/" className="block">
            {settings.logo ? (
              <img src={settings.logo} alt="BY ANNIE" className="h-14 w-auto mix-blend-difference" />
            ) : (
              <h1 className="font-syne text-xl font-bold tracking-tighter mix-blend-difference text-white">
                BY ANNIE
              </h1>
            )}
          </Link>
        </div>

        {/* Center: Nav */}
        <div className="pearl-refraction pointer-events-auto hidden md:flex gap-10 px-8 py-3 font-syne text-[10px] uppercase tracking-[0.3em]">
          <Link to="/shop" className="transition-colors hover:text-rose">Shop</Link>
          <a href="#pearls" className="transition-colors hover:text-rose">Jewelry</a>
          <a href="#decor" className="transition-colors hover:text-rose">Decor</a>
          <a href="#lingerie" className="transition-colors hover:text-rose">Lingerie</a>
        </div>

        {/* Right: Cart + Admin */}
        <div className="pointer-events-auto flex items-center gap-8">
          <button onClick={openCart} className="hidden sm:inline relative text-white/60 hover:text-rose transition-colors font-syne text-[10px] uppercase tracking-[0.3em]">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 min-w-[16px] h-[16px] bg-rose text-[#050505] text-[8px] font-bold rounded-full flex items-center justify-center px-1">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
          <Link to="/admin" className="hidden sm:inline text-white/30 hover:text-rose transition-colors font-syne text-[10px] uppercase tracking-[0.3em]">
            Admin
          </Link>
        </div>
      </header>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenu(!mobileMenu)}
        className="md:hidden fixed top-10 right-10 z-[101] p-2 text-white/60 hover:text-rose transition-colors"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenu ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            <div className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileMenu(false)} />
            <div className="fixed top-0 left-0 right-0 z-[100] md:hidden">
              <div className="glass-nav-scrolled m-4 rounded-2xl p-6 space-y-4">
                <Link to="/shop" onClick={() => setMobileMenu(false)} className="block py-3 text-sm font-syne uppercase tracking-[0.2em] text-white/70 hover:text-rose transition-colors">
                  Shop All
                </Link>
                <a href="#pearls" onClick={() => setMobileMenu(false)} className="block py-3 text-sm font-syne uppercase tracking-[0.2em] text-white/70 hover:text-rose transition-colors">
                  Jewelry
                </a>
                <a href="#decor" onClick={() => setMobileMenu(false)} className="block py-3 text-sm font-syne uppercase tracking-[0.2em] text-white/70 hover:text-rose transition-colors">
                  Decor
                </a>
                <a href="#lingerie" onClick={() => setMobileMenu(false)} className="block py-3 text-sm font-syne uppercase tracking-[0.2em] text-white/70 hover:text-rose transition-colors">
                  Lingerie
                </a>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <button onClick={() => { openCart(); setMobileMenu(false) }} className="block py-3 text-sm font-syne uppercase tracking-[0.2em] text-white/70 hover:text-rose transition-colors w-full text-left">
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </button>
                  <Link to="/admin" onClick={() => setMobileMenu(false)} className="block py-3 text-sm font-syne uppercase tracking-[0.2em] text-white/30 hover:text-rose transition-colors">
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
