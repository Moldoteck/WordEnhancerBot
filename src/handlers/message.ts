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
    let new_msg = []
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

      new_msg = new_msg.concat([[1, txt_to_replace], [0, lnk]])
      last_ind = start + offset
    }
    let txt_to_replace = orig_msg.substring(last_ind)
    txt_to_replace = replaceAll(txt_to_replace, '&', '&amp;')
    txt_to_replace = replaceAll(txt_to_replace, '<', '&lt;')
    txt_to_replace = replaceAll(txt_to_replace, '>', '&gt;')
    new_msg = new_msg.concat([[1, txt_to_replace]])

    let triggers = ctx.dbchannel.triggers

    let newStringArray = replaceWords(new_msg, triggers)

    let old_msg = new_msg.map(elem => elem[1]).join('')
    let final_msg = newStringArray.map(elem => elem[1]).join('')

    if (final_msg.length > 0 && final_msg.length != old_msg.length) {
      if (ctx.dbchannel) {
        try {
          ctx.telegram.editMessageText(ctx.dbchannel.id, ctx.update.channel_post.message_id, undefined, final_msg, { parse_mode: 'HTML' })
        } catch (e) {
          console.log('Error is: ' + e)
        }
      }
    }
  }
}

//function to replace a list of words with another word
function replaceWords(oldStringArray, triggers) {
  //send here an array of pairs of text and if should be parsed
  //if something is replaced, it should not be parsed further
  //can create bigger array of smaller text
  let newStringArray = oldStringArray
  let words = Object.keys(triggers)
  words.sort((a, b) => { return b.length - a.length })//Bigger strings are more important
  for (let i = 0; i < words.length; i++) {
    newStringArray = replaceWord(newStringArray, words[i], triggers[words[i]])
  }
  return newStringArray
}

function splitStringInArray(sourceStr, searchStr, replaceStr) {
  let newStringArray = []

  // find all indexes of matched string
  const indexes = [...sourceStr.matchAll(new RegExp(searchStr, 'g'))].map(a => a.index)

  //split string in array on substrings
  // 1 - can be processed in the future
  // 0 - can't be processed for other triggers
  let startIndex = 0
  for (let i = 0; i < indexes.length; i++) {
    if (startIndex != indexes[i]) {
      newStringArray.push([1, sourceStr.substring(startIndex, indexes[i])])
    }
    startIndex = indexes[i] + searchStr.length

    newStringArray.push([0, `<a href='${replaceStr}'>${searchStr}</a>`])
  }
  if (startIndex != sourceStr.length) {
    newStringArray.push([1, sourceStr.substring(startIndex)])
  }
  return newStringArray
}

function replaceWord(stringArray, word, replaceWith) {
  let newStringArray = []
  for (let i = 0; i < stringArray.length; i++) {
    if (stringArray[i][0] == 1) {
      newStringArray = newStringArray.concat(splitStringInArray(stringArray[i][1], word, replaceWith))
    } else {
      newStringArray.push(stringArray[i])
    }
  }
  return newStringArray
}