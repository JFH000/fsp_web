import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const isProduction = process.env.VITE_APP_ENV === 'production'

const content = isProduction
  ? 'User-agent: *\nAllow: /\n'
  : 'User-agent: *\nDisallow: /\n'

const outPath = fileURLToPath(new URL('../public/robots.txt', import.meta.url))
writeFileSync(outPath, content)

console.log(
  `[generate-robots] VITE_APP_ENV=${process.env.VITE_APP_ENV ?? '(unset)'} -> ${isProduction ? 'Allow' : 'Disallow'}`,
)
