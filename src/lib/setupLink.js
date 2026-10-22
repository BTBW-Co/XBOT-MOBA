/** Token da tela de e-mail e agenda, se o link for desta origem. */
export function setupTokenFromHref(href, currentHost = '') {
  let url
  try {
    url = new URL(String(href || ''), 'https://moba.xbotone.com')
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\./, '')
  const here = String(currentHost || '').replace(/^www\./, '')
  if (host !== here && host !== 'moba.xbotone.com') return null
  const match = url.pathname.match(/^\/setup\/([^/]+)\/?$/)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}
