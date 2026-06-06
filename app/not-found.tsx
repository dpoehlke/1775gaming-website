import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-marine-black flex flex-col items-center justify-center text-center px-4">
      <p className="font-heading text-gold text-2xl tracking-[0.3em] mb-2">
        ERROR 404
      </p>
      <h1 className="font-heading text-scarlet text-7xl tracking-widest mb-4">
        MISSION LOST
      </h1>
      <p className="text-silver text-lg mb-8 max-w-md">
        The page you&apos;re looking for has gone MIA. Fall back to base and
        regroup.
      </p>
      <Link
        href="/"
        className="bg-scarlet hover:bg-red-700 text-white font-heading text-xl tracking-widest px-8 py-3 border-2 border-gold transition-colors"
      >
        RETURN TO BASE
      </Link>
    </div>
  )
}
