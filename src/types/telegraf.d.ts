import I18N from 'telegraf-i18n'
import { Channel } from '@/models'
import { DocumentType } from '@typegoose/typegoose'

declare module 'telegraf' {
  export class Context {
    dbchannel: DocumentType<Channel>
    i18n: I18N
  }
}
