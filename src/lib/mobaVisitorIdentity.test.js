import test from 'node:test'
import assert from 'node:assert/strict'
import {
  readVisitorIdentity,
  storeVisitorIdentity,
  installVisitorIdentityExpiry,
  rememberVisitorProfile,
  visitorDisplayLabel,
} from './mobaVisitorIdentity.js'
const values = new Map()
const memoryStorage = {
  getItem: key => values.get(key) || null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
}
globalThis.sessionStorage = memoryStorage
globalThis.localStorage = memoryStorage

test('verified identity survives navigation and expires', () => {
  values.clear()
  const data = { visitor_id: 'ext_mv_' + 'a'.repeat(32), channel_id: 'channel', expires_in: 86400 }
  storeVisitorIdentity(data, '7XGVD9J')
  assert.equal(readVisitorIdentity().visitor_id, data.visitor_id)
  assert.equal(readVisitorIdentity().channel_id, 'channel')
  storeVisitorIdentity({ ...data, expires_in: -1 }, '7XGVD9J')
  assert.equal(readVisitorIdentity(), null)
})

test('SMS identity is never accepted as an administrative operator token', () => {
  storeVisitorIdentity({ visitor_id: 'not-a-visitor-grant', expires_in: 86400 }, '7XGVD9J')
  assert.equal(readVisitorIdentity(), null)
  assert.equal(sessionStorage.getItem('xbot_operator_token'), null)
})

test('phone login keeps the person on the credential and shows the name', () => {
  values.clear()
  storeVisitorIdentity({ visitor_id: 'ext_mv_' + 'b'.repeat(32), channel_id: 'channel', expires_in: 86400 }, '7XGVD9J')
  const saved = rememberVisitorProfile({ name: 'Ana', email: 'ana@example.com', phone: '5554981000000' })
  assert.equal(saved.name, 'Ana')
  assert.equal(readVisitorIdentity().email, 'ana@example.com')
  assert.equal(visitorDisplayLabel(readVisitorIdentity()), 'Ana')
  rememberVisitorProfile({ name: '', email: '', phone: '' })
  assert.equal(readVisitorIdentity().name, 'Ana')
  assert.equal(visitorDisplayLabel({ phone: '5554981000000' }), '+55 (54) 98100-0000')
  rememberVisitorProfile({ invite_url: 'https://moba.xbotone.com/invite/k7m2qx' })
  assert.equal(readVisitorIdentity().invite_url, 'https://moba.xbotone.com/invite/k7m2qx')
  rememberVisitorProfile({ name: 'Ana' })
  assert.equal(readVisitorIdentity().invite_url, 'https://moba.xbotone.com/invite/k7m2qx')
  rememberVisitorProfile({ invite_url: '' })
  assert.equal(readVisitorIdentity().invite_url, undefined)
})

test('server rejection clears even an expired identity and asks for login again', async () => {
  let destination
  globalThis.window = { fetch: async () => ({ status: 401 }), location: { replace: url => { destination = url } } }
  storeVisitorIdentity({ visitor_id: 'ext_mv_' + 'a'.repeat(32), expires_in: -1 }, '7XGVD9J')
  installVisitorIdentityExpiry()
  await window.fetch('https://api.example/v1/xchat/history')
  assert.equal(destination, '/?object_id=7XGVD9J')
  assert.equal(sessionStorage.getItem('moba_verified_visitor'), null)
})

test('personal assistant expiry returns to the phone home', async () => {
  let destination
  globalThis.window = { fetch: async () => ({ status: 401 }), location: { replace: url => { destination = url } } }
  delete window.__mobaVisitorExpiryInstalled
  storeVisitorIdentity({ visitor_id: 'ext_mv_' + 'c'.repeat(32), expires_in: 86400 }, 'personal')
  installVisitorIdentityExpiry()
  await window.fetch('https://api.example/v1/xchat/history')
  assert.equal(destination, '/')
})
