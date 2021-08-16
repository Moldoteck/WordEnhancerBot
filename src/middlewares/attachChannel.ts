import { findChannel } from '@/models'
import { Context } from 'telegraf'

export async function attachChannel(ctx: Context, next: () => void) {
  if (ctx.chat) {
    if (ctx.chat.type == 'channel') {
      ctx.dbchannel = await findChannel(ctx.chat.id)
    } else {
      let channel = await ctx.getChat()
      if ('linked_chat_id' in channel) {
        let chn_id = channel.linked_chat_id
        ctx.dbchannel = await findChannel(chn_id)
      } else {
        ctx.reply("Beware, this bot is for channels! Can't find a channel for this chat")
      }
    }
  }
  return next()
}
