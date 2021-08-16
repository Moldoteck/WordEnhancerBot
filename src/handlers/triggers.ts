import { Context } from 'telegraf'

async function isChannelOwner(ctx: Context, check_id: number) {
  let admins = await ctx.getChatAdministrators()
  for (let i = 0; i < admins.length; i++) {
    if (admins[i].user.id == check_id) {
      if (admins[i].status == 'creator') {
        return true
      }
    }
  }
  return false
}

export async function addChatTrigger(ctx: Context) {
  //reply to message which has text, space and url
  console.log(ctx.message)
  if (ctx.chat.type != 'private') {
    if ('text' in ctx.message) {
      if (isChannelOwner(ctx, ctx.from.id)) {
        if (ctx.dbchannel) {
          let ind_trig = ctx.message.text.indexOf(' ')
          let ind_link = ctx.message.text.lastIndexOf(' ')

          if (ind_trig < 0) {
            ctx.reply('Trigger must not be empty', { reply_to_message_id: ctx.message.message_id })
            return
          }
          if (ind_link == ind_trig) {
            ctx.reply('Link must not be empty', { reply_to_message_id: ctx.message.message_id })
            return
          }

          let trigger = ctx.message.text.substring(ind_trig + 1, ind_link)
          let link = ctx.message.text.substring(ind_link + 1)

          let channel = ctx.dbchannel
          channel.triggers[trigger] = link
          channel.markModified('triggers')
          channel = await (channel as any).save()
          ctx.reply('Trigger added', { reply_to_message_id: ctx.message.message_id })

        } else {
          ctx.reply("Beware, this bot is for channels! Can't find a channel for this chat", { reply_to_message_id: ctx.message.message_id })
        }
      } else {
        ctx.reply('You are not the owner of the chat, please see /help', { reply_to_message_id: ctx.message.message_id })
      }
    }
  } else {
    ctx.reply('This bot is for channels, not private messages, please see /help', { reply_to_message_id: ctx.message.message_id })
  }
}

export async function rmChatTrigger(ctx: Context) {
  //reply to message which has text, space and url
  if (ctx.chat.type != 'private') {
    if ('text' in ctx.message) {
      if (isChannelOwner(ctx, ctx.from.id)) {
        if (ctx.dbchannel) {
          let trigger = ctx.message.text.split(' ').slice(1).join(' ')

          if (trigger.length == 0) {
            ctx.reply('Trigger must not be empty', { reply_to_message_id: ctx.message.message_id })
            return
          }

          let channel = ctx.dbchannel
          delete channel.triggers[trigger]
          channel.markModified('triggers')
          channel = await (channel as any).save()

          ctx.reply('Trigger removed', { reply_to_message_id: ctx.message.message_id })
        } else {
          ctx.reply("Beware, this bot is for channels! Can't find a channel for this chat", { reply_to_message_id: ctx.message.message_id })
        }
      } else {
        ctx.reply('You are not the owner of the chat, please see /help', { reply_to_message_id: ctx.message.message_id })
      }
    }
  } else {
    ctx.reply('This bot is for channels, not private messages, please see /help', { reply_to_message_id: ctx.message.message_id })
  }
}

export async function allCTrigger(ctx: Context) {
  //reply to message which has text, space and url
  if (ctx.dbchannel) {
    if (isChannelOwner(ctx, ctx.from.id)) {
      let triggers = ctx.dbchannel.triggers
      ctx.reply(JSON.stringify(triggers, null, 2), { reply_to_message_id: ctx.message.message_id })
    } else {
      ctx.reply('You are not the owner of the chat, please see /help', { reply_to_message_id: ctx.message.message_id })
    }
  } else {
    ctx.reply("Beware, this bot is for channels! Can't find a channel for this chat", { reply_to_message_id: ctx.message.message_id })
  }
}