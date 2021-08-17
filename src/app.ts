import { localeActions } from './handlers/language'
// Setup @/ aliases for modules
import 'module-alias/register'
// Config dotenv
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// Dependencies
import { bot } from '@/helpers/bot'
import { ignoreOldMessageUpdates } from '@/middlewares/ignoreOldMessageUpdates'
import { sendHelp } from '@/handlers/sendHelp'
import { i18n, attachI18N } from '@/helpers/i18n'
import { setLanguage, sendLanguage } from '@/handlers/language'
import { addChatTrigger, allCTrigger, rmChatTrigger } from './handlers/triggers'
import { enhanceChannelMessage } from './handlers/message'
import { attachChannel } from './middlewares/attachChannel'
import { countChan, setCommands } from './handlers/commands'

// Middlewares
bot.use(ignoreOldMessageUpdates)
bot.use(attachChannel)
bot.use(i18n.middleware(), attachI18N)

// Commands
bot.command(['help', 'start'], sendHelp)
bot.command('language', sendLanguage)

bot.command('addtrig', addChatTrigger)
bot.command('rmtrig', rmChatTrigger)
bot.command('alltrig', allCTrigger)
bot.command('cmd', setCommands)
bot.command('countChan', countChan)

bot.on('channel_post', enhanceChannelMessage)

// Actions
bot.action(localeActions, setLanguage)
// Errors
bot.catch(console.error)
// Start bot
bot.launch().then(() => {
  console.info(`Bot ${bot.botInfo.username} is up and running`)
})
