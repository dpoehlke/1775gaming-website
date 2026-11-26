/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // Allows Google Analytics inline scripts and self-hosted fonts/styles.
            // 'unsafe-inline' for scripts is required by the gtag snippet in layout.tsx.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        // After-Hours Lead Kit demo + owner console (static files in public/leadkit).
        // Listed after the site-wide rule so this CSP overrides it for these pages only:
        // they load the chat widget from, and call, the Lead Kit Supabase functions.
        source: '/leadkit/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://ksizqvecclwvevfzdjnb.supabase.co https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://ksizqvecclwvevfzdjnb.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ]
  },
}
export default nextConfig
