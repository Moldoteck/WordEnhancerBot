import { Message, Update } from 'telegraf/typings/core/types/typegram';

export function detectURL(message) {
    const entities = message.entities || message.caption_entities || []
    let detected_urls = []
    let url_place = []
    let url_type = []
    for (const entity of entities) {
        if (entity.type === 'text_link' || entity.type === 'url') {
            if ('url' in entity) {
                detected_urls.push(entity.url)
                url_place.push([entity.offset, entity.length])
                url_type.push('link')
            } else {
                if ('text' in message) {
                    let det_url = (message.text).substr(
                        entity.offset,
                        entity.length
                    )
                    url_place.push([entity.offset, entity.length])
                    detected_urls.push(det_url)
                    url_type.push('link')
                } else if ('caption' in message) {
                    let det_url = (message.caption).substr(
                        entity.offset,
                        entity.length
                    )
                    url_place.push([entity.offset, entity.length])
                    detected_urls.push(det_url)
                    url_type.push('link')
                }
            }
        } else if (['bold', 'italic', 'underline', 'strikethrough'].includes(entity.type)) {
            //, 
            detected_urls.push('')
            url_place.push([entity.offset, entity.length])
            url_type.push(entity.type)
        }
    }
    return [detected_urls, url_place, url_type]
}
