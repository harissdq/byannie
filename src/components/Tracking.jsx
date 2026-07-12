import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { trackOrder } from '../lib/store'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

export default function Tracking() {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode) {
      setCode(urlCode.toUpperCase())
      doTrack(urlCode)
    }
  }, [])

  const doTrack = async (trackCode) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await trackOrder(trackCode.trim())
      setResult(data)
    } catch {
      setError('No order found with this tracking code.')
    } finally {
      setLoading(false)
    }
  }

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    doTrack(code.trim())
  }

  const currentIdx = result ? STATUS_STEPS.indexOf(result.status) : -1

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-12">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-syne text-3xl sm:text-4xl text-white text-center mb-2">Track Your Order</h1>
          <p className="text-sm text-white/50 text-center mb-10">Enter your tracking code to see your order status</p>

          <form onSubmit={handleTrack} className="mb-10">
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD34"
                className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm tracking-[0.15em] uppercase placeholder:text-white/25 focus:border-rose/40 focus:outline-none transition-colors"
                maxLength={12}
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="btn-rose px-6 py-3.5 rounded-xl text-xs tracking-[0.15em] uppercase font-medium disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Checking...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center mb-10">
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-8">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Order for</p>
                <p className="font-syne text-xl text-white">{result.customerName}</p>
                <p className="text-xs text-white/40 mt-1 font-mono tracking-wider">{result.trackingCode}</p>
              </div>

              {/* Status Steps */}
              <div className="relative mb-8">
                <div className="absolute top-4 left-0 right-0 h-px bg-white/10" />
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, idx) => {
                    const active = idx <= currentIdx
                    const isCurrent = idx === currentIdx
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <motion.div
                          initial={false}
                          animate={{ scale: isCurrent ? 1.2 : 1, backgroundColor: active ? '#D4919E' : 'transparent' }}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                            active ? 'border-rose' : 'border-white/15'
                          }`}
                        >
                          {active && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </motion.div>
                        <span className={`text-[9px] tracking-[0.1em] uppercase mt-2 font-medium ${active ? 'text-white' : 'text-white/30'}`}>
                          {step}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-white/5 pt-5 flex justify-between text-xs text-white/40">
                <span>Ordered: {result.createdAt ? new Date(result.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</span>
                <span>Updated: {result.updatedAt ? new Date(result.updatedAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</span>
              </div>
            </motion.div>
          )}

          <div className="text-center mt-10">
            <Link to="/" className="text-xs text-white/30 hover:text-rose transition-colors tracking-wider uppercase">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
