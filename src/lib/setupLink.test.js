import test from 'node:test'
import assert from 'node:assert/strict'
import { setupTokenFromHref } from './setupLink.js'

test('setup link on this host opens in the conversation', () => {
  assert.equal(
    setupTokenFromHref('https://moba.xbotone.com/setup/abc-def_12', 'moba.xbotone.com'),
    'abc-def_12',
  )
  assert.equal(
    setupTokenFromHref('https://moba.xbotone.com/setup/abc?from=whatsapp', 'moba.xbotone.com'),
    'abc',
  )
  assert.equal(setupTokenFromHref('https://accounts.google.com/o/oauth', 'moba.xbotone.com'), null)
  assert.equal(setupTokenFromHref('https://moba.xbotone.com/K7X9QM2', 'moba.xbotone.com'), null)
})
