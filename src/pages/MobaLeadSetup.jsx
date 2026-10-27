import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { completeLeadConnect, connectLeadMeea, deleteLeadAccount, fetchLeadSetup, startLeadConnect } from '../api/moba'
import { clearVisitorIdentity, storeVisitorIdentity } from '../lib/mobaVisitorIdentity'

const ICONS = {
  gmail: '/icons/gmail.svg',
  googledrive: '/icons/google-drive.svg',
  googledocs: '/icons/google-docs.svg',
  googlesheets: '/icons/google-sheets.svg',
  googleslides: '/icons/google-slides.svg',
  googletasks: '/icons/google-tasks.svg',
  exist: '/icons/health.svg',
  github: '/icons/github.svg',
  googlecalendar: '/icons/google-calendar.svg',
  outlook: '/icons/outlook.svg',
  meea: '/icons/meea.svg',
}

const GOOGLE = ['gmail', 'googlecalendar', 'googledrive', 'googledocs', 'googlesheets', 'googleslides', 'googletasks']
const TOOL_DESCRIPTIONS = {
  gmail: 'Ler e resumir e-mails, preparar respostas e organizar mensagens.',
  googlecalendar: 'Consultar horários e criar, alterar ou cancelar compromissos.',
  googledrive: 'Buscar, ler e organizar arquivos e pastas.',
  googledocs: 'Ler, criar e editar documentos.',
  googlesheets: 'Consultar e atualizar planilhas, linhas e células.',
  googleslides: 'Consultar, criar e editar apresentações.',
  googletasks: 'Consultar, criar, atualizar e concluir tarefas.',
}
const SINGLES = [
  { toolkit: 'outlook', label: 'Outlook', blurb: 'Ler, responder e organizar o e-mail do Outlook.' },
  { toolkit: 'github', label: 'GitHub', blurb: 'Consultar e gerenciar repositórios, PRs e issues.' },
  { toolkit: 'exist', label: 'Health', blurb: 'Consultar e registrar os dados disponíveis na sua conta.' },
]

export default function MobaLeadSetup({ token: tokenProp, onClose }) {
  const params = useParams()
  const token = tokenProp || params.token
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const fromWhatsapp = !onClose && searchParams.get('from') === 'whatsapp'
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 820px)').matches)
  const [view, setView] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState('')
  const [menu, setMenu] = useState(false)
  const [section, setSection] = useState('workspace')
  const [copied, setCopied] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [meeaKey, setMeeaKey] = useState('')
  const [meeaOpen, setMeeaOpen] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 820px)')
    const apply = () => setNarrow(query.matches)
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchLeadSetup(token)
        if (cancelled) return
        setError('')
        setView(data)
        if (data?.session?.visitor_id) {
          storeVisitorIdentity(data.session, 'personal')
        }
        if (searchParams.get('done') === '1') {
          const toolkit = searchParams.get('toolkit') || data?.toolkit || 'gmail'
          const result = await completeLeadConnect(token, toolkit, {
            bundle: searchParams.get('bundle') === '1',
            returnTo: searchParams.get('from') === 'whatsapp' ? 'whatsapp' : undefined,
          })
          if (cancelled) return
          if (result?.redirect_url) {
            window.location.assign(result.redirect_url)
            return
          }
          if (result?.ok) {
            setNotice(result.message || 'Conta ligada.')
            setSection('connected')
          } else setError(result?.message || 'A conta ainda não apareceu.')
          const fresh = await fetchLeadSetup(token).catch(() => data)
          if (!cancelled) setView(fresh)
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Link expirado')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, searchParams])

  async function saveMeea(event) {
    event.preventDefault()
    const apiKey = meeaKey.trim()
    if (!apiKey) {
      setError('Cole a chave do MCP da Meea.')
      return
    }
    setBusy('meea')
    setError('')
    try {
      const result = await connectLeadMeea(token, apiKey)
      setMeeaKey('')
      setMeeaOpen(false)
      if (result?.ok) {
        setNotice(result.message || 'Meea ligada.')
        setSection('connected')
      } else setError(result?.message || 'Não consegui ligar a Meea.')
      const fresh = await fetchLeadSetup(token).catch(() => view)
      setView(fresh)
    } catch (err) {
      setError(err?.message || 'Não consegui ligar a Meea.')
    } finally {
      setBusy('')
    }
  }

  async function connect(toolkit) {
    setBusy(toolkit)
    setError('')
    try {
      const data = await startLeadConnect(token, toolkit, {
        returnTo: fromWhatsapp ? 'whatsapp' : undefined,
      })
      if (data?.redirect_url) {
        window.location.assign(data.redirect_url)
        return
      }
      setError('Não consegui abrir a conexão.')
    } catch (err) {
      setError(err?.message || 'Não consegui abrir a conexão.')
    } finally {
      setBusy('')
    }
  }

  async function removeAccount() {
    setBusy('delete')
    setError('')
    try {
      await deleteLeadAccount(token)
      clearVisitorIdentity()
      window.location.assign('/')
    } catch (err) {
      setError(err?.message || 'Não consegui apagar a conta.')
      setBusy('')
    }
  }

  function goBack() {
    if (onClose) {
      onClose()
      return
    }
    if (fromWhatsapp || section === 'connected') {
      window.location.assign(view?.whatsapp_url || 'whatsapp://')
      return
    }
    navigate('/')
  }

  function openSection(next) {
    setSection(next)
    setMenu(false)
    setCopied('')
  }

  async function copyText(value, key) {
    const text = String(value || '').trim()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
    } catch {
      setCopied('')
    }
  }

  const tools = view?.tools || []
  const bySlug = Object.fromEntries(tools.map((tool) => [tool.toolkit, tool]))
  const googleTools = GOOGLE.map((slug) => bySlug[slug]).filter(Boolean)
  const phone = formatPhone(view?.phone)
  const line = formatPhone(view?.xbot_phone)
  const displayName = view?.full_name || view?.name || ''

  if (!narrow) {
    return (
      <main className="moba-workspace moba-workspace-gate">
        <h1>Continue no celular</h1>
        <p>Esta conta abre por um destes canais. O workspace fica no telefone.</p>
        <button
          type="button"
          className="moba-workspace-primary"
          disabled={!view?.whatsapp_url}
          onClick={() => window.location.assign(view.whatsapp_url)}
        >
          WhatsApp
        </button>
        <button type="button" className="moba-workspace-primary is-blocked" disabled>
          iMessage
        </button>
        <p className="moba-workspace-help">O iMessage ainda não envia.</p>
      </main>
    )
  }

  return (
    <main className="moba-workspace">
      <header className="moba-workspace-bar">
        <button type="button" className="moba-workspace-iconbtn" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenu((open) => !open)}>
          {menu ? '×' : '☰'}
        </button>
        <span className="moba-workspace-brand">
          <span className="moba-workspace-brand-mark">xbot</span>
          <span className="moba-workspace-brand-product">MOBA</span>
        </span>
        <span />
      </header>
      {menu ? (
        <nav className="moba-workspace-menu" aria-label="Conta deste telefone">
          <button type="button" onClick={() => openSection('workspace')}>Workspace</button>
          <button type="button" onClick={() => openSection('people')}>Pessoas de confiança</button>
          <button type="button" onClick={() => openSection('preferences')}>Preferências</button>
          <button type="button" onClick={() => openSection('invite')}>Convidar</button>
          <button type="button" onClick={goBack}>Voltar à conversa</button>
          {displayName ? <p className="moba-workspace-who">{displayName}</p> : null}
          {phone ? <p className="moba-workspace-who">{phone}</p> : null}
        </nav>
      ) : null}
      {error ? <p className="moba-setup-error">{error}</p> : null}
      {menu ? null : section === 'connected' ? (
        <section className="moba-workspace-hero">
          <h1>Conta ligada neste telefone.</h1>
          {notice ? <p>{notice}</p> : null}
          <button type="button" className="moba-workspace-primary" onClick={goBack}>Voltar ao WhatsApp</button>
          <button type="button" className="moba-workspace-link" onClick={() => openSection('workspace')}>Abrir a conta</button>
        </section>
      ) : null}
      {!menu && section === 'workspace' ? (
        <>
          <section className="moba-workspace-block">
            <h2>Contato</h2>
            <p className="moba-workspace-help">Por onde este telefone fala com o Xbot.</p>
            <Row
              title="WhatsApp"
              detail={line || 'Linha do Xbot'}
              action="Abrir"
              onAction={() => window.location.assign(view?.whatsapp_url || 'whatsapp://')}
            />
            <Row title="Este telefone" detail={phone || 'Telefone do lead'} />
          </section>
          <section className="moba-workspace-block">
            <h2>Conectores</h2>
            <p className="moba-workspace-help">Conecte cada serviço Google separadamente. As ações disponíveis dependem das permissões que você autorizar e das ferramentas de cada conta.</p>
            <p className="moba-workspace-help">Peça as ações na conversa pessoal do Moba ou no WhatsApp. Antes de enviar, alterar ou excluir algo, o assistente mostra os detalhes para você confirmar.</p>
            {googleTools.map((tool) => {
              const linked = tool.status === 'connected'
              const account = accountLine(tool)
              const description = TOOL_DESCRIPTIONS[tool.toolkit] || tool.description
              return (
                <article key={tool.toolkit} className="moba-workspace-connector">
                  <div>
                    <strong>{tool.label}</strong>
                    <p>{description}</p>
                    {account ? <p className="moba-workspace-account">{account}</p> : null}
                  </div>
                  <button type="button" disabled={Boolean(busy)} onClick={() => connect(tool.toolkit)}>
                    {busy === tool.toolkit ? 'Abrindo…' : linked ? 'Trocar conta' : 'Conectar'}
                  </button>
                </article>
              )
            })}
            <article className="moba-workspace-connector">
              <div>
                <strong>Meea</strong>
                <p>
                  {bySlug.meea?.status === 'connected'
                    ? 'Reuniões e ferramentas disponíveis na sua conta conectada.'
                    : 'Conecte a chave da sua conta para usar as ferramentas de reuniões disponíveis.'}
                </p>
                {meeaOpen ? (
                  <form className="moba-workspace-key" onSubmit={saveMeea}>
                    <input
                      type="password"
                      name="meea-api-key"
                      autoComplete="off"
                      spellCheck="false"
                      placeholder="mk_live_…"
                      value={meeaKey}
                      onChange={(event) => setMeeaKey(event.target.value)}
                      aria-label="Chave do MCP da Meea"
                    />
                    <button type="submit" disabled={busy === 'meea'}>Ligar</button>
                  </form>
                ) : null}
              </div>
              <button type="button" disabled={busy === 'meea'} onClick={() => setMeeaOpen(true)}>
                {bySlug.meea?.status === 'connected' ? 'Trocar' : 'Adicionar conta'}
              </button>
            </article>
            {SINGLES.map((item) => {
              const tool = bySlug[item.toolkit]
              const linked = tool?.status === 'connected'
              return (
                <article key={item.toolkit} className="moba-workspace-connector">
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.blurb}</p>
                    {linked && accountLine(tool) ? <p className="moba-workspace-account">{accountLine(tool)}</p> : null}
                  </div>
                  <button type="button" disabled={busy === item.toolkit} onClick={() => connect(item.toolkit)}>
                    {linked ? 'Trocar' : 'Conectar'}
                  </button>
                </article>
              )
            })}
            <p className="moba-workspace-help">Você também pode pedir lembretes e resumos periódicos. A entrega precisa de uma conversa pessoal do Moba ou de um WhatsApp verificado e conectado. O iMessage ainda não está disponível.</p>
          </section>
        </>
      ) : null}
      {!menu && section === 'people' ? (
        <section className="moba-workspace-block">
          <h2>Seu link</h2>
          <p className="moba-workspace-help">Convide alguém de confiança. O assistente dela só alcança o seu quando os dois aceitam.</p>
          <div className="moba-workspace-linkrow">
            <span>{view?.invite_url || 'O convite aparece quando esta pessoa está no cadastro.'}</span>
            {view?.invite_url ? (
              <button type="button" onClick={() => copyText(view.invite_url, 'people')}>{copied === 'people' ? 'Copiado' : 'Copiar'}</button>
            ) : null}
          </div>
          <h2>Pessoas</h2>
          {(view?.people || []).length ? (
            <ul className="moba-workspace-list">
              {view.people.map((name) => <li key={name}>{name}</li>)}
            </ul>
          ) : (
            <p className="moba-workspace-empty">Ninguém ligado ainda.</p>
          )}
        </section>
      ) : null}
      {!menu && section === 'invite' ? (
        <section className="moba-workspace-block">
          <h1>Convidar</h1>
          <p>O mesmo link serve para mais de uma pessoa. A vaga conta quando alguém entra.</p>
          <p>{view?.invites_used || 0} de {view?.invite_quota || 0} convites usados.</p>
          {view?.invite_open ? null : <p>O link passa a aceitar gente quando as ferramentas desta pessoa forem liberadas e ainda houver vaga.</p>}
          {view?.invite_url ? <p className="moba-workspace-url">{view.invite_url}</p> : null}
          <button type="button" className="moba-workspace-primary" disabled={!view?.invite_url} onClick={() => copyText(view?.invite_url, 'invite')}>
            {copied === 'invite' ? 'Link copiado' : 'Copiar convite'}
          </button>
        </section>
      ) : null}
      {!menu && section === 'preferences' ? (
        <section className="moba-workspace-block">
          <h2>Nome</h2>
          <p className="moba-workspace-help">O nome deste lead no Xbot.</p>
          <p className="moba-workspace-field">{displayName || 'Sem nome'}</p>
          <h2>Entrada</h2>
          <p className="moba-workspace-help">O telefone identifica a pessoa. Não é uma senha de computador.</p>
          <Row title="Telefone" detail={phone || 'Sem telefone'} />
          <h2>WhatsApp</h2>
          <p className="moba-workspace-help">O número por onde esta pessoa fala com o Xbot.</p>
          <Row title={phone ? 'Conectado' : 'Ainda sem número'} detail={phone} />
          <h2>Conta</h2>
          <p className="moba-workspace-help">Apaga esta conta e os dados ligados a ela.</p>
          <div className="moba-workspace-row">
            <div>
              <strong>Excluir conta</strong>
              <span>
                {confirmDelete
                  ? 'Isso não volta. Saem o lead, as contas ligadas e a conversa deste telefone.'
                  : 'Some o lead e o que está ligado a este telefone.'}
              </span>
            </div>
            <button
              type="button"
              className="moba-workspace-danger"
              disabled={busy === 'delete'}
              onClick={() => (confirmDelete ? removeAccount() : setConfirmDelete(true))}
            >
              {busy === 'delete' ? 'Apagando' : confirmDelete ? 'Apagar' : 'Excluir'}
            </button>
          </div>
        </section>
      ) : null}
    </main>
  )
}

function Row({ title, detail, action, onAction }) {
  return (
    <div className="moba-workspace-row">
      <div>
        <strong>{title}</strong>
        {detail ? <span>{detail}</span> : null}
      </div>
      {action ? <button type="button" onClick={onAction}>{action}</button> : null}
    </div>
  )
}

function accountLine(tool) {
  const account = String(tool?.account || '').trim()
  if (!account) return ''
  if (tool?.toolkit === 'googlecalendar' && !account.includes('@')) return ''
  return account
}

function formatPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    const ddd = digits.slice(2, 4)
    const rest = digits.slice(4)
    if (rest.length === 9) return `+55 ${ddd} ${rest.slice(0, 5)}-${rest.slice(5)}`
    if (rest.length === 8) return `+55 ${ddd} ${rest.slice(0, 4)}-${rest.slice(4)}`
  }
  return digits ? `+${digits}` : ''
}
