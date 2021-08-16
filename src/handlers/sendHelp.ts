import { Context } from 'telegraf'

export function sendHelp(ctx: Context) {
  return ctx.replyWithHTML(ctx.i18n.t('help'), { reply_to_message_id: ctx.message.message_id })
}
