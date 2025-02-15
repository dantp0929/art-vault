import { spoiler } from 'discord.js'

export const buildMessage = (link: string, tags: string[] = [], spoilers: string[] = []): string => {
  let message = ''
  if (spoilers.length > 0) {
    message += `Spoilers for ${buildSpoilers(spoilers)} - ${spoiler(link + (tags.length > 0 ? ' - ' + tags.join(', ') : ''))} `
  } else {
    message += `${link}${(tags.length > 0 ? ' - ' + tags.join(', ') : '')}`
  }

  return message
}

const buildSpoilers = (spoilers: string[]): string => {
  if (spoilers.length === 0) {
    return ''
  }
  if (spoilers.length === 1) {
    return `'${spoilers[0]}'`
  }
  if (spoilers.length === 2) {
    return `'${spoilers[0]}' and '${spoilers[1]}'`
  }

  let result = ''
  spoilers.forEach((s, i) => {
    if (i !== spoilers.length - 1) {
      result += `'${s}', `
    } else {
      result += `and '${s}'`
    }
  })
  return result
}
