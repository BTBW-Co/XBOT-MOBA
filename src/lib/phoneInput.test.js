import assert from 'node:assert/strict'
import test from 'node:test'
import { caretForDigitCount, digitsForCountry, displayPhone, resolvePhone, suggestIso } from './phoneInput.js'

test('brasil formata DDD e celular', () => {
  assert.equal(displayPhone('BR', '54981387397'), '+55 (54) 98138-7397')
  const parsed = resolvePhone('5554981387397', 'US')
  assert.equal(parsed.iso, 'BR')
  assert.equal(parsed.display, '+55 (54) 98138-7397')
  assert.equal(parsed.e164, '5554981387397')
})

test('trocar o DDI no número troca o país', () => {
  assert.equal(resolvePhone('595819289182912', 'BR').iso, 'PY')
  assert.equal(resolvePhone('595819289182912', 'BR').display, '+595 819289182912')
  assert.equal(resolvePhone('54', 'BR').iso, 'AR')
  assert.equal(resolvePhone('1', 'BR').iso, 'US')
  assert.equal(resolvePhone('1', 'BR').display, '+1')
})

test('código incompleto não troca a bandeira', () => {
  const parsed = resolvePhone('59', 'BR')
  assert.equal(parsed.pending, true)
  assert.equal(parsed.iso, 'BR')
  assert.equal(parsed.display, '+59')
  assert.equal(parsed.e164, '')
})

test('DDI compartilhado preserva o país escolhido', () => {
  const canada = resolvePhone('14155550134', 'CA')
  assert.equal(canada.iso, 'CA')
  assert.equal(resolvePhone('14155550134', 'US').iso, 'US')
})

test('escolher outro país mantém o número nacional', () => {
  assert.equal(digitsForCountry('US', '5554981387397', 'BR'), '154981387397')
  assert.equal(digitsForCountry('PY', '55', 'BR'), '595')
})

test('cursor acompanha os dígitos da máscara', () => {
  assert.equal(caretForDigitCount('+55 (54) 98138-7397', 4), 7)
})

test('país inicial segue o idioma do navegador', () => {
  assert.equal(suggestIso('es', 'pt-BR'), 'BR')
  assert.equal(suggestIso('en', 'en'), 'US')
  assert.equal(suggestIso('es', 'es'), 'ES')
})
