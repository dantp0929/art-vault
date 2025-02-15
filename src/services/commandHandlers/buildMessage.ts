import { spoiler } from 'discord.js'

export const buildMessage = (link: string, tags: string[] = [], spoilers: string[] = []): string => {
  let message = ''
  if (spoilers.length > 0) {
    message += `Spoilers for ${spoilers.join(', ')} - ${spoiler(link + (tags.length > 0 ? ' - ' + tags.join(', ') : ''))} `
  } else {
    message += `${link}${(tags.length > 0 ? ' - ' + tags.join(', ') : '')}`
  }

  return message
}
