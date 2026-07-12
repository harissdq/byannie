import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { getCollections, on } from '../lib/store'

const VIDEO_SRC = '/videos/enterprice/kinetic-fashion-elements.mp4'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.23, 1, 0.32, 1] },
  }),
}

export default function Hero() {
  const videoRef = useRef(null)
  const [collections, setCollections] = useState([])
  const [trackCode, setTrackCode] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    vid.muted = true
    vid.loop = false
    vid.playsInline = true
    vid.controls = false
    vid.removeAttribute('controls')

    let raf
    let playingForward = true
    const REV_SPEED = 0.03

    const startForward = () => {
      playingForward = true
      vid.play().catch(() => {})
    }

    const reverseTick = () => {
      if (playingForward) return
      if (vid.currentTime > 0.04) {
        vid.currentTime -= REV_SPEED
        raf = requestAnimationFrame(reverseTick)
      } else {
        vid.currentTime = 0
        startForward()
      }
    }

    const onEnded = () => {
      if (playingForward) {
        playingForward = false
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(reverseTick)
      }
    }

    vid.addEventListener('ended', onEnded)
    startForward()

    return () => {
      vid.removeEventListener('ended', onEnded)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const load = () => setCollections(getCollections().slice(0, 4))
    load()
    const unsub = on('collections-loaded', load)
    return unsub
  }, [])

  return (
    <section className="relative grid h-screen w-screen grid-cols-1 overflow-hidden md:grid-cols-[65fr_35fr]">
      {/* Rose glow background */}
      <div className="orange-bleed absolute inset-0 z-0 animate-glow" />

      {/* Left: Video in arch-portal */}
      <div className="relative flex items-end justify-center overflow-hidden border-r border-white/5 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_#D4919E_0%,_transparent_60%)] opacity-20" />

        <div className="arch-portal group relative h-[90%] w-[85%] overflow-hidden bg-[#D4919E]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            className="h-full w-full object-cover object-left video-no-controls"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
        </div>

        {/* Decorative elements */}
        <div className="absolute left-0 top-1/2 h-px w-full -rotate-12 bg-white/10" />
        <div className="absolute right-1/4 top-1/3 h-32 w-32 animate-float rounded-full border border-white/5" />
      </div>

      {/* Right: Content */}
      <div className="relative z-10 flex flex-col justify-center bg-[#050505]/20 p-12 backdrop-blur-sm md:p-24">
        <div className="mb-8">
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-syne text-5xl md:text-7xl leading-[0.8] uppercase tracking-tighter text-white"
          >
            BY
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1px #F5F5F7' }}>
              ANNIE
            </span>
          </motion.h2>
        </div>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-[40px] saturate-[1.8]"
        >
          <p className="text-sm font-light uppercase tracking-widest text-white/70">
            Exquisite artificial jewelry meticulously crafted for the modern Pakistani woman — from bridal grandeur to everyday grace.
          </p>

          <Link
            to="/shop"
            className="pearl-refraction mt-10 block w-full px-10 py-4 font-syne text-[9px] uppercase tracking-[0.4em] text-center"
          >
            Explore Shop
          </Link>
        </motion.div>

        {/* Collection pills */}
        {collections.length > 0 && (
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap gap-2"
          >
            {collections.map((col) => (
              <Link
                key={col.id}
                to="/shop"
                className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-syne uppercase tracking-[0.2em] text-white/50 transition-all duration-300 hover:border-rose/40 hover:text-rose"
              >
                {col.name}
              </Link>
            ))}
          </motion.div>
        )}

        {/* Order Tracking */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8"
        >
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Track your order</p>
          <form onSubmit={(e) => { e.preventDefault(); if (trackCode.trim()) navigate(`/track?code=${trackCode.trim()}`) }} className="flex gap-2">
            <input
              type="text"
              value={trackCode}
              onChange={e => setTrackCode(e.target.value.toUpperCase())}
              placeholder="Tracking code"
              className="flex-1 max-w-[200px] bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] tracking-[0.15em] uppercase text-white placeholder:text-white/20 focus:border-rose/40 focus:outline-none transition-colors"
              maxLength={12}
            />
            <button
              type="submit"
              disabled={!trackCode.trim()}
              className="px-4 py-2 rounded-full border border-rose/20 text-[9px] font-syne uppercase tracking-[0.2em] text-rose/70 transition-all duration-300 hover:border-rose/40 hover:text-rose disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Track
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
