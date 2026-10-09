import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const service = process.argv[2] || 'app'

function sha() {
  const fromEnv = (process.env.AWS_COMMIT_ID || process.env.GIT_SHA || '').trim()
  if (fromEnv) return fromEnv.slice(0, 12)
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 12)
  } catch {
    return ''
  }
}

let version = ''
try {
  version = JSON.parse(readFileSync('package.json', 'utf8')).version || ''
} catch {
  version = ''
}

mkdirSync('public', { recursive: true })
writeFileSync(
  'public/version.json',
  `${JSON.stringify({ service, sha: sha(), version })}\n`,
)
