import { detectURL } from '@/helpers/url'
import { Context } from 'telegraf'

//Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function replaceAll(str, match, replacement) {
  return str.replace(new RegExp(escapeRegExp(match), 'g'), () => replacement);
}

export async function enhanceChannelMessage(ctx: Context) {
  if ('channel_post' in ctx.update) {
    let [final_urls, url_place, url_type] = detectURL(ctx.update.channel_post)
    let orig_msg = 'text' in ctx.update.channel_post ? ctx.update.channel_post.text : 'caption' in ctx.update.channel_post ? ctx.update.channel_post.caption : ''
    let new_msg = ''
    let last_ind = 0

    let changed = false
    for (let ind = 0; ind < final_urls.length; ++ind) {
      let elem = final_urls[ind]
      let [start, offset] = url_place[ind]
      let link_txt = orig_msg.substr(start, offset)
      let lnk = `<a href='${elem}'>${link_txt}</a>`
      //todo: add support for multiple links in one message when one smaller

      let txt_to_replace = orig_msg.substring(last_ind, start)
      txt_to_replace = replaceAll(txt_to_replace, '&', '&amp;')
      txt_to_replace = replaceAll(txt_to_replace, '<', '&lt;')
      txt_to_replace = replaceAll(txt_to_replace, '>', '&gt;')

      let triggers = ctx.dbchannel.triggers

      let new_txt_to_replace = replaceWords(txt_to_replace, triggers)

      if (new_txt_to_replace.length !== txt_to_replace.length) {
        changed = true
      }
      txt_to_replace = new_txt_to_replace

      new_msg = new_msg + txt_to_replace + lnk
      last_ind = start + offset
    }
    let txt_to_replace = orig_msg.substring(last_ind)
    txt_to_replace = replaceAll(txt_to_replace, '&', '&amp;')
    txt_to_replace = replaceAll(txt_to_replace, '<', '&lt;')
    txt_to_replace = replaceAll(txt_to_replace, '>', '&gt;')

    let triggers = ctx.dbchannel.triggers

    let new_txt_to_replace = replaceWords(txt_to_replace, triggers)
    if (new_txt_to_replace.length !== txt_to_replace.length) {
      changed = true
    }
    new_msg = new_msg + new_txt_to_replace//last chunk
    if (new_msg.length > 0 && changed) {
      if (ctx.dbchannel) {
        try {
          ctx.telegram.editMessageText(ctx.dbchannel.id, ctx.update.channel_post.message_id, undefined, new_msg, { parse_mode: 'HTML' })
        } catch (e) {
          console.log('Error is: ' + e)
        }
      }
    }
  }
}

//function to replace a list of words with another word
function replaceWords(text, triggers) {
  //send here an array of pairs of text and if should be parsed
  //if something is replaced, it should not be parsed further
  //can create bigger array of smaller text
  let words = Object.keys(triggers)
  for (let i = 0; i < words.length; i++) {
    // text = text.replaceAll(words[i], `<a href='${triggers[words[i]]}'>${words[i]}</a>`)
    text = replaceAll(text, words[i], `<a href='${triggers[words[i]]}'>${words[i]}</a>`)
  }
  return text
}
