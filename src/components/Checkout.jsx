import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCart, getCartTotal, clearCart, fetchOrders, on, formatPKR, getSettings } from '../lib/store'

const PAYMENT_ICONS = {
  'Cash on Delivery': '💵',
  'JazzCash': '📱',
  'Easypaisa': '💳',
  'Bank Transfer': '🏦',
  'HBL Connect': '🏦',
  'UBL': '🏦',
  'Meezan Bank': '🏦',
}
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']
const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'ICT', 'Gilgit-Baltistan', 'AJK']
const IMG_FALLBACK = 'https://images.unsplash.com/photo-1515562141589-69f0c2aa1f2d?w=200&q=80'
const STEPS = ['Delivery', 'Payment', 'Confirm']

export default function Checkout() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(getSettings())
  const [cart, setCart] = useState(getCart())
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState(null)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '', city: '', province: 'Punjab', zip: '', paymentMethod: '' })
  const [errors, setErrors] = useState({})
  const [orderResult, setOrderResult] = useState(null)

  useEffect(() => { const unsub = on('cart-updated', () => setCart(getCart())); return unsub }, [])
  useEffect(() => { const handler = () => setSettings(getSettings()); window.addEventListener('annie:settings-updated', handler); return () => window.removeEventListener('annie:settings-updated', handler) }, [])

  const total = getCartTotal()
  const shipping = total > 2000 ? 0 : 150
  const grandTotal = total + shipping

  const PAYMENT_METHODS = (settings.paymentMethods || ['Cash on Delivery']).filter(Boolean).map(name => ({
    id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name,
    icon: PAYMENT_ICONS[name] || '💳',
    description: `Pay via ${name}`,
    instructions: settings.whatsapp ? `Contact us on WhatsApp: ${settings.whatsapp} for payment details.` : 'Contact us for payment details.',
  }))

  const updateField = (field, value) => { setForm(p => ({ ...p, [field]: value })); if (errors[field]) setErrors(p => ({ ...p, [field]: null })) }

  const validateStep = (n) => {
    const e = {}
    if (n === 1) {
      if (!form.fullName.trim()) e.fullName = 'Required'
      if (!form.phone.trim()) e.phone = 'Required'
      else if (form.phone.replace(/[^0-9]/g, '').length < 10) e.phone = 'Enter valid phone'
      if (!form.address.trim()) e.address = 'Required'
      if (!form.city) e.city = 'Required'
    } else if (n === 2) {
      if (!form.paymentMethod) e.paymentMethod = 'Select a method'
    }
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(2)) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: form.fullName, email: form.email || 'N/A', phone: form.phone,
          items: cart.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price, variant: i.variant })),
          total: grandTotal, status: 'pending', address: { line1: form.address, city: form.city, state: form.province, zip: form.zip || 'N/A', country: 'Pakistan' },
          paymentMethod: PAYMENT_METHODS.find(m => m.id === form.paymentMethod)?.name || form.paymentMethod
        }) })
      const orderData = await res.json()
      setOrderResult(orderData)
      fetchOrders()
    } catch (err) { console.error(err) }
    clearCart(); setCompleted(true); setSubmitting(false)
  }

  if (completed) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-sm mx-auto px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }} className="relative w-20 h-20 mx-auto mb-6">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ delay: 0.4, duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-white/5" />
          <div className="absolute inset-0 rounded-full bg-white/10 border border-rose/15 flex items-center justify-center">
            <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="w-8 h-8 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </motion.svg>
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-2xl font-syne text-white mb-3">Order Confirmed!</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-white/50 text-sm mb-2">Thank you for shopping with Annie.</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="text-xs text-white/50/70 mb-4">We'll contact you at <span className="text-white">{form.phone}</span></motion.p>
        {orderResult?.trackingCode && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-6 inline-block">
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1">Your Tracking Code</p>
            <p className="font-syne text-lg tracking-[0.15em] text-rose">{orderResult.trackingCode}</p>
            <p className="text-[10px] text-white/30 mt-1">Use this to track your order on the homepage</p>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Link to="/" className="btn-rose px-8 py-3 rounded-full text-[12px] tracking-[0.12em] uppercase inline-block">Continue Shopping</Link>
          {orderResult?.trackingCode && (
            <Link to={`/track?code=${orderResult.trackingCode}`} className="block mt-3 text-[11px] text-white/40 hover:text-rose transition-colors tracking-wider uppercase">Track this order</Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  )

  if (cart.length === 0) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <svg className="w-7 h-7 text-rose/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      </div>
      <p className="text-white/50 text-lg font-syne">Your bag is empty</p>
      <Link to="/" className="btn-outline-rose px-6 py-2 rounded-full text-[11px] tracking-[0.12em] uppercase">Browse collection</Link>
    </div>
  )

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Steps */}
        <div className="flex items-center justify-center mb-10 lg:mb-14">
          {STEPS.map((label, idx) => {
            const n = idx + 1; const active = n <= step; const current = n === step
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div animate={{ scale: current ? 1.1 : 1, backgroundColor: active ? '#D4919E' : '#FFF5F7' }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-medium border transition-colors ${
                      active ? 'border-rose/30 text-white' : 'border-white/10 text-white/50/40'
                    }`}>
                    {n < step ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : n}
                  </motion.div>
                  <span className={`text-[10px] tracking-[0.12em] uppercase mt-1.5 font-medium ${active ? 'text-white' : 'text-white/50/40'}`}>{label}</span>
                </div>
                {idx < 2 && (
                  <div className="w-14 sm:w-20 h-[1px] mx-2 mb-5 relative">
                    <div className="absolute inset-0 bg-rose/10" />
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: n < step ? 1 : 0 }} className="absolute inset-0 bg-gradient-to-r from-rose to-rose-deep origin-left" transition={{ duration: 0.4 }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
                    <h2 className="text-xl font-syne text-white mb-1.5">Delivery Details</h2>
                    <p className="text-xs text-white/50 mb-6">Where shall we send your treasure?</p>
                    <div className="space-y-4">
                      <Field label="Full Name" error={errors.fullName} required>
                        <input type="text" value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Fatima Ahmed" className={fieldCls(errors.fullName)} />
                      </Field>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Phone" error={errors.phone} required>
                          <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="0300-1234567" className={fieldCls(errors.phone)} />
                        </Field>
                        <Field label="Email" hint="Optional">
                          <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="fatima@email.com" className={fieldCls()} />
                        </Field>
                      </div>
                      <Field label="Delivery Address" error={errors.address} required>
                        <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="House 12, Block B, Model Town" className={fieldCls(errors.address)} />
                      </Field>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="City" error={errors.city} required>
                          <select value={form.city} onChange={e => updateField('city', e.target.value)} className={fieldCls(errors.city)}>
                            <option value="">Select</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                        <Field label="Province">
                          <select value={form.province} onChange={e => updateField('province', e.target.value)} className={fieldCls()}>
                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </Field>
                        <Field label="Postal Code" hint="Optional">
                          <input type="text" value={form.zip} onChange={e => updateField('zip', e.target.value)} placeholder="54000" className={fieldCls()} />
                        </Field>
                      </div>
                    </div>
                    <button type="button" onClick={() => { if (validateStep(1)) { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
                      className="mt-8 w-full btn-rose py-3.5 rounded-xl text-[12px] tracking-[0.12em] uppercase font-medium">Continue to Payment</button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
                    <h2 className="text-xl font-syne text-white mb-1.5">Payment Method</h2>
                    <p className="text-xs text-white/50 mb-6">Choose how you'd like to pay</p>
                    <div className="space-y-2.5 mb-5">
                      {PAYMENT_METHODS.map(m => (
                        <button key={m.id} type="button" onClick={() => { updateField('paymentMethod', m.id); setSelectedPaymentInfo(m) }}
                          className={`payment-card w-full flex items-center gap-3.5 p-4 rounded-xl text-left transition-all ${
                            form.paymentMethod === m.id ? 'selected' : 'bg-[#0a0a0a] border-2 border-transparent hover:border-white/10'
                          }`}>
                          <span className="text-xl w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">{m.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{m.name}</p>
                            <p className="text-[11px] text-white/50 mt-0.5">{m.description}</p>
                          </div>
                          {form.paymentMethod === m.id && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-rose flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                    <AnimatePresence>
                      {selectedPaymentInfo && form.paymentMethod && (
                        <motion.div key={form.paymentMethod} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
                          <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3.5 h-3.5 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-[13px] text-white/50 leading-relaxed">{selectedPaymentInfo.instructions}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {errors.paymentMethod && <p className="text-rose text-xs mb-3 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.paymentMethod}</p>}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button type="button" onClick={() => setStep(1)} className="btn-outline-rose px-6 py-3.5 rounded-xl text-[12px] tracking-wider uppercase font-medium order-2 sm:order-1">Back</button>
                      <button type="submit" disabled={submitting}
                        className={`flex-1 py-3.5 rounded-xl text-[12px] tracking-[0.12em] uppercase font-medium order-1 sm:order-2 ${submitting ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'btn-rose'}`}>
                        {submitting ? <span className="flex items-center justify-center gap-2"><motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></motion.svg>Processing...</span> : `Place Order — ${formatPKR(grandTotal)}`}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-5 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] tracking-[0.18em] uppercase text-white font-medium">Order Summary</h3>
                <span className="text-[10px] text-white/50">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
              </div>
              <ul className="space-y-3 mb-4 max-h-[240px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <li key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5">
                      <img src={item.image || IMG_FALLBACK} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white truncate font-medium">{item.name}</p>
                      <p className="text-[10px] text-white/50">{item.variant} x{item.quantity}</p>
                      <p className="text-[12px] text-rose font-medium">{formatPKR(item.price * item.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/5 pt-3 space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span className="text-white">{formatPKR(total)}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Delivery</span><span className={shipping === 0 ? 'text-rose font-medium' : 'text-white'}>{shipping === 0 ? 'Free' : formatPKR(shipping)}</span></div>
                <div className="border-t border-white/5 pt-2.5 flex justify-between items-baseline">
                  <span className="font-syne text-base text-white">Total</span>
                  <span className="font-syne text-lg text-rose">{formatPKR(grandTotal)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"><svg className="w-3 h-3 text-rose/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                  <span className="text-[10px] text-white/50/60 tracking-wider">Secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"><svg className="w-3 h-3 text-rose/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                  <span className="text-[10px] text-white/50/60 tracking-wider">Free delivery over Rs. 2,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, required, hint, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 mb-1">
        <span className="text-[11px] text-white/50 tracking-[0.1em] uppercase font-medium">{label}</span>
        {required && <span className="text-rose/50 text-[9px]">*</span>}
        {hint && <span className="text-[10px] text-white/50/40 normal-case tracking-normal">({hint})</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className="text-rose text-[11px] mt-1">{error}</motion.p>}
      </AnimatePresence>
    </div>
  )
}

function fieldCls(error) {
  return `w-full ${error ? 'border-rose/40 focus:border-white/50' : ''}`
}
