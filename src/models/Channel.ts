import { prop, getModelForClass } from '@typegoose/typegoose'

export class Channel {
  @prop({ required: true, index: true, unique: true })
  id: number

  @prop({ required: true, default: 'en' })
  language: string
  
  @prop({ required: true, default: {} })
  triggers: Object
}

// Get Channels model
const ChannelModel = getModelForClass(Channel, {
  schemaOptions: { timestamps: true },
})

// Get or create channels
export async function findChannel(id: number) {
  let channel = await ChannelModel.findOne({ id })
  if (!channel) {
    // Try/catch is used to avoid race conditions
    try {
      channel = await new ChannelModel({ id }).save()
    } catch (err) {
      channel = await ChannelModel.findOne({ id })
    }
  }
  return channel
}

export async function countChannels() {
  return await ChannelModel.countDocuments({})
}