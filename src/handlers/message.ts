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
    let [final_urls, url_place, entity_type] = detectURL(ctx.update.channel_post)
    let orig_msg = 'text' in ctx.update.channel_post ? ctx.update.channel_post.text : 'caption' in ctx.update.channel_post ? ctx.update.channel_post.caption : ''
    let new_msg = []
    let last_ind = 0

    let changed = false
    for (let ind = 0; ind < final_urls.length; ++ind) {
      let elem = final_urls[ind]
      let [start, offset] = url_place[ind]
      let link_txt = orig_msg.substr(start, offset)
      //todo: add support for multiple links in one message when one smaller

      let txt_to_replace = orig_msg.substring(last_ind, start)

      let ent = undefined
      if (entity_type[ind] == 'link') {
        ent = [[0, `<a href='${elem}'>`, [99999, 99999]], [0, `${link_txt}`, [start, start + offset]], [0, `</a>`, [99999, 99999]]]
        new_msg = new_msg.concat([[1, txt_to_replace, [last_ind, start]]])
        new_msg = new_msg.concat(ent)

        last_ind = start + offset
      }
    }

    let txt_to_replace = orig_msg.substring(last_ind)
    new_msg = new_msg.concat([[1, txt_to_replace, [last_ind, orig_msg.length]]])

    let replacers = { 'bold': ['<b>', '</b>'], 'italic': ['<i>', '</i>'], 'underline': ['<u>', '</u>'], 'strikethrough': ['<s>', '</s>'] }
    for (let ind = 0; ind < final_urls.length; ++ind) {
      if (entity_type[ind] in replacers) {
        let i = 0;
        let start = url_place[ind][0]
        let end = start + url_place[ind][1]

        let chn1 = false
        while (i < new_msg.length) {
          let indexes = new_msg[i][2]

          if (!chn1 && indexes[0] <= start && start < indexes[1]) {
            let deleted = new_msg.splice(i, 1)

            let br_el = deleted[0][1].slice(0, start - indexes[0])
            new_msg.splice(i, 0, [1, br_el, [indexes[0], indexes[0] + br_el.length]])
            new_msg.splice(i + 1, 0, [0, replacers[entity_type[ind]][0], [99999, 99999]])
            new_msg.splice(i + 2, 0, [1, deleted[0][1].slice(start - indexes[0]), [indexes[0] + br_el.length, indexes[1]]])

            chn1 = true
          }
          indexes = new_msg[i][2]
          if (indexes[0] < end && end <= indexes[1]) {
            let deleted = new_msg.splice(i, 1)

            let br_el = deleted[0][1].slice(0, end - indexes[0])
            new_msg.splice(i, 0, [1, br_el, [indexes[0], indexes[0] + br_el.length]])
            new_msg.splice(i + 1, 0, [0, replacers[entity_type[ind]][1], [99999, 99999]])
            new_msg.splice(i + 2, 0, [1, deleted[0][1].slice(end - indexes[0]), [indexes[0] + br_el.length, indexes[1]]])

            break
          }
          if (chn1) {
            i += 2
          } else {
            i += 1
          }
        }
      }
    }
    for (let i = 0; i < new_msg.length; ++i) {
      if (new_msg[i][0] == 1) {
        new_msg[i][1] = replaceAll(new_msg[i][1], '&', '&amp;')
        new_msg[i][1] = replaceAll(new_msg[i][1], '<', '&lt;')
        new_msg[i][1] = replaceAll(new_msg[i][1], '>', '&gt;')
      }
    }
    
    let triggers = ctx.dbchannel.triggers

    let newStringArray = replaceWords(new_msg, triggers)

    let old_msg = new_msg.map(elem => elem[1]).join('')
    let final_msg = newStringArray.map(elem => elem[1]).join('')

    if (final_msg.length > 0 && final_msg.length != old_msg.length) {
      if (ctx.dbchannel) {
        try {
          await ctx.telegram.editMessageText(ctx.dbchannel.id, ctx.update.channel_post.message_id, undefined, final_msg, { parse_mode: 'HTML' })
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