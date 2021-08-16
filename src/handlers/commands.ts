import { Context } from 'telegraf'
import { BotCommand } from 'telegraf/typings/core/types/typegram'

let commands: BotCommand[] = [
  { command: 'addtrig', description: 'Add new channel post trigger' },
  { command: 'rmtrig', description: 'Remove channel post trigger' },
  { command: 'alltrig', description: 'List all channel post triggers' },
  { command: 'help', description: 'Get help' }
]

export async function setCommands(ctx: Context) {
  if (ctx.from.id == 180001222) {
    ctx.telegram.setMyCommands(commands)
  }
}
