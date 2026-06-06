'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-marine-black flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-heading text-scarlet text-6xl tracking-widest mb-4">
        SYSTEM FAILURE
      </h1>
      <p className="text-silver text-lg mb-8 max-w-md">
        Something went wrong on our end. Our team has been notified.
      </p>
      <button
        onClick={reset}
        className="bg-scarlet hover:bg-red-700 text-white font-heading text-xl tracking-widest px-8 py-3 border-2 border-gold transition-colors"
      >
        TRY AGAIN
      </button>
    </div>
  )
}
