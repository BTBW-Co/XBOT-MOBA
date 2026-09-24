import { WORKFORCE_LOADER_BOTS } from '../lib/workforceLoaderBots'

/**
 * Mesmo loader do Chat do operador (XbotWorkforceLoader): avatares Workforce
 * sobrepostos com enter + float.
 */
export default function MobaBootLoader() {
  return (
    <div className="moba-boot" role="status" aria-live="polite" aria-label="Conectando">
      <span className="moba-boot-stack" aria-hidden="true">
        {WORKFORCE_LOADER_BOTS.map((bot, index) => (
          <span
            key={bot.id}
            className="moba-boot-avatar"
            style={{
              zIndex: index + 1,
              '--moba-loader-enter-delay': bot.delay,
              '--moba-loader-float-delay': bot.floatDelay,
            }}
            dangerouslySetInnerHTML={{ __html: bot.iconSvg }}
          />
        ))}
      </span>
    </div>
  )
}
