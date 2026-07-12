import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCart, removeFromCart, updateCartQuantity, getCartTotal, getCartCount, closeCart, on, formatPKR } from '../lib/store'

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1515562141589-69f0c2aa1f2d?w=400&q=80'

export default function CartDrawer({ onClose }) {
  const [cart, setCart] = useState(getCart())
  const [removingId, setRemovingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = on('cart-updated', () => setCart(getCart()))
    return unsub
  }, [])

  const total = getCartTotal()
  const count = getCartCount()
  const freeThreshold = 2000
  const remaining = Math.max(0, freeThreshold - total)

  const handleCheckout = () => { onClose(); setTimeout(() => navigate('/checkout'), 150) }

  const handleRemove = (id) => {
    setRemovingId(id)
    setTimeout(() => { removeFromCart(id); setRemovingId(null) }, 300)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[60]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-charcoal/15 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
        className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl shadow-rose/5 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <h2 className="font-syne text-xl text-white">Your Bag</h2>
            {count > 0 && (
              <motion.span key={count} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-white/10 text-rose text-[10px] font-medium rounded-full">
                {count}
              </motion.span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200" aria-label="Close">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Free Delivery */}
        {cart.length > 0 && (
          <div className="px-5 pt-3 pb-1">
            {remaining > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-white/50">Add {formatPKR(remaining)} more for <span className="text-rose font-medium">free delivery</span></span>
                  <svg className="w-3.5 h-3.5 text-rose/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (total / freeThreshold) * 100)}%` }} transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-rose to-rose-deep rounded-full" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-rose/80">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Free delivery!
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cart.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-rose/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h3 className="font-syne text-lg text-white mb-1">Your bag is empty</h3>
              <p className="text-xs text-white/50 mb-5 max-w-[200px]">Discover our handcrafted jewelry collection.</p>
              <button onClick={onClose} className="btn-outline-rose px-6 py-2 rounded-full text-[11px] tracking-[0.12em] uppercase">Continue Shopping</button>
            </motion.div>
          ) : (
            <ul className="space-y-2.5">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.li key={item.id} layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: removingId === item.id ? 0.4 : 1, x: 0, scale: removingId === item.id ? 0.96 : 1 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5">
                      <img src={item.image || IMG_FALLBACK} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[13px] text-white font-medium truncate">{item.name}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">{item.variant}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-0 bg-[#0a0a0a] rounded-full border border-white/10">
                          <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white rounded-full transition-colors">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M20 12H4" /></svg>
                          </button>
                          <span className="w-6 text-center text-[11px] text-white font-medium">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white rounded-full transition-colors">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-rose font-medium">{formatPKR(item.price * item.quantity)}</span>
                          <button onClick={() => handleRemove(item.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-white/50/50 hover:text-rose hover:bg-white/5 transition-all">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="border-t border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Subtotal</span>
              <motion.span key={total} initial={{ opacity: 0.5, y: -3 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-syne text-rose">
                {formatPKR(total)}
              </motion.span>
            </div>
            <p className="text-[10px] text-white/50/60 tracking-wider">
              {remaining > 0 ? 'Rs. 150 delivery fee · Free over Rs. 2,000' : 'Free standard delivery included'}
            </p>
            <motion.button onClick={handleCheckout} whileTap={{ scale: 0.98 }}
              className="w-full btn-rose py-3 rounded-xl text-[12px] tracking-[0.12em] uppercase font-medium">
              Proceed to Checkout
            </motion.button>
            <button onClick={onClose} className="w-full text-[11px] text-white/50 hover:text-white transition-colors duration-300 tracking-wider uppercase py-1">
              Continue Shopping
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
