/**
 * One-time utility to generate ADMIN_PASSWORD_HASH for .env.local
 *
 * Usage:
 *   node scripts/hash-admin-password.mjs
 *
 * Paste the output value into ADMIN_PASSWORD_HASH in .env.local and Vercel.
 * Format: sha256:<hex-salt>:<hex-digest>
 */
import { createHash, randomBytes } from 'crypto'
import { createInterface } from 'readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })

rl.question('Enter the admin password to hash: ', (password) => {
  rl.close()
  if (!password) {
    console.error('No password provided.')
    process.exit(1)
  }
  const salt = randomBytes(16).toString('hex')
  const digest = createHash('sha256').update(salt + password).digest('hex')
  const hash = `sha256:${salt}:${digest}`
  console.log('\nSet this in .env.local and Vercel:\n')
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)
  console.log('\nDo NOT share or commit this value.')
})
