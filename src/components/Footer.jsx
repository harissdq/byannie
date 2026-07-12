import { useState, useEffect } from 'react'
import { getSettings } from '../lib/store'

export default function Footer() {
  const [settings, setSettings] = useState(getSettings())

  useEffect(() => {
    setSettings(getSettings())
    const onSettings = () => setSettings(getSettings())
    window.addEventListener('annie:settings-updated', onSettings)
    return () => window.removeEventListener('annie:settings-updated', onSettings)
  }, [])

  return (
    <footer id="footer" className="relative overflow-hidden bg-[#050505] pb-20 pt-60">
      {/* Concentric circles */}
      <div className="absolute left-1/2 top-0 z-0 h-[100vh] w-[200vw] -translate-x-1/2 rounded-[100%] border border-rose/20" />
      <div className="absolute left-1/2 top-20 z-0 h-[90vh] w-[180vw] -translate-x-1/2 rounded-[100%] border border-white/5" />

      <div className="relative z-10 mx-auto max-w-7xl px-12 text-center">
        {/* Giant watermark */}
        <h2 className="mb-20 select-none font-syne text-[18vw] font-bold uppercase leading-none tracking-tighter opacity-10">
          ANNIE
        </h2>

        <div className="grid grid-cols-1 items-end gap-20 md:grid-cols-3">
          {/* Left: Social */}
          <div className="space-y-4 text-left font-syne text-[9px] uppercase tracking-[0.5em] text-[#f5f5f7]/40">
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:text-rose">Instagram</a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:text-rose">Facebook</a>
            )}
            {settings.showroom && (
              <a href={settings.showroom} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:text-rose">Showroom</a>
            )}
            {!settings.instagram && !settings.facebook && !settings.showroom && (
              <span className="block">Contact us for more</span>
            )}
          </div>

          {/* Center: Pearl logo */}
          <div className="flex flex-col items-center">
            <div className="pearl-refraction mb-8 flex h-20 w-20 items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-rose" />
            </div>
            <p className="font-syne text-[10px] uppercase tracking-widest">
              The Future of Adornment
            </p>
          </div>

          {/* Right: Contact + Copyright */}
          <div className="font-manrope text-right text-[10px] uppercase tracking-[0.2em] text-[#f5f5f7]/20">
            {settings.phone && (
              <p className="mb-1">
                <a href={`tel:${settings.phone}`} className="hover:text-rose transition-colors">{settings.phone}</a>
              </p>
            )}
            {settings.email && (
              <p className="mb-2">
                <a href={`mailto:${settings.email}`} className="hover:text-rose transition-colors">{settings.email}</a>
              </p>
            )}
            {settings.paymentMethods && settings.paymentMethods.length > 0 && (
              <div className="mb-3">
                <p className="text-[#f5f5f7]/30 mb-1">We Accept</p>
                <div className="flex flex-wrap justify-end gap-2">
                  {settings.paymentMethods.filter(Boolean).map((m, i) => (
                    <span key={i} className="inline-block border border-white/10 rounded px-2 py-0.5 text-[8px] tracking-wider">{m}</span>
                  ))}
                </div>
              </div>
            )}
            <p>&copy; 2026 {settings.storeName || 'BY ANNIE'}</p>
            <a href="https://instagram.com/harisrsiddiqui" target="_blank" rel="noopener noreferrer" className="hover:text-rose transition-colors">
              Digital Director
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
