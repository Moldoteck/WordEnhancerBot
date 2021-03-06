import { countChannels } from '@/models'
import { Context } from 'telegraf'
import { BotCommand } from 'telegraf/typings/core/types/typegram'

let commands: BotCommand[] = [
  { command: 'addtrig', description: 'Add new channel post trigger' },
  { command: 'rmtrig', description: 'Remove channel post trigger' },
  { command: 'alltrig', description: 'List all channel post triggers' },
  { command: 'help', description: 'Get help' }
]

export async function setCommands(ctx: Context) {
  if ('' + ctx.from.id == process.env.OWNER_ID) {
    ctx.telegram.setMyCommands(commands)
  }
}

export async function countChan(ctx: Context) {
  if ('' + ctx.from.id == process.env.OWNER_ID) {
    let channels = await countChannels()
    //TODO: check remained channels
    ctx.reply('Total channels ' + channels)
  }
  else {
    console.log(ctx.from.id, process.env.OWNER_ID)
  }
}