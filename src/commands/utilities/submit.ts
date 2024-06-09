import { type Client } from 'pg'
import { SlashCommandBuilder } from 'discord.js'
import { createSubmission, createTags, getSubmissionByLink, getTags, updateSubmission } from '../../services/queries'
import { SubmissionError } from '../../models/Errors'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Submit an art piece!')
    .addStringOption(option =>
      option.setName('link')
        .setDescription('URL source of the art piece.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tags')
        .setDescription('Comma separated tags for the art piece.')),
  async execute (interaction: any, dbClient: Client) {
    try {
      const submitter: string = interaction.user.username
      const externalLink = getTransformedLink(new URL(interaction.options.getString('link'))) // eslint-disable-line @typescript-eslint/no-unsafe-argument
      let tags = ((interaction.options.getString('tags') as string) ?? '').split(',').map(tag => tag.trim()).filter(tag => !!tag)
      const currentTime = new Date().toISOString()

      const existingSubmission = (await getSubmissionByLink(dbClient, externalLink)).rows[0]

      await dbClient.query('BEGIN')

      if (existingSubmission) {
        const existingMessageId = existingSubmission.discordLink.split('/').at(6)
        const existingMessage = await interaction.channel?.messages.fetch(existingMessageId).catch((e: any) => { console.log(e) })

        const existingTags = (await getTags(dbClient, existingSubmission.id)).rows
        const newTags = tags
        existingTags.forEach(row => {
          if (newTags.includes(row.tag)) {
            newTags.splice(newTags.indexOf(row.tag), 1)
          }
        })

        // The submission's latest post still exists
        if (existingMessage !== undefined) {
          if (newTags.length > 0) {
            await createTags(dbClient, existingSubmission.id, newTags)
            newTags.push(...existingTags.map(r => r.tag))
            existingMessage.edit(`${externalLink} - ${newTags.join(', ')}`)
            throw new SubmissionError(`This link has already been submitted: ${existingSubmission.discordLink} \nTags have been updated.`)
          }
          throw new Error(`This link has already been submitted: ${existingSubmission.discordLink}\nhttps://tenor.com/view/cringe-gif-24107071`)
        }
        tags = [...newTags, ...existingTags.map(r => r.tag)]
      }

      // Send a reply and retrieve the link
      const reply = await interaction.reply({
        content: tags.length > 0 ? `${externalLink} - ${tags.join(', ')}` : externalLink,
        fetchReply: true
      })
      const discordLink = `https://discord.com/channels/${reply.guildId}/${reply.channelId}/${reply.id}`

      // Insert into submissions and submission_tags tables
      if (existingSubmission) {
        await updateSubmission(dbClient, existingSubmission.id, discordLink, currentTime)
        const newTags = await getNewTags(dbClient, existingSubmission.id, tags)
        await createTags(dbClient, existingSubmission.id, newTags)
      } else {
        const submission = await createSubmission(dbClient, submitter, externalLink, discordLink, currentTime)
        await createTags(dbClient, submission.rows[0].id, tags)
      }

      await dbClient.query('COMMIT')
    } catch (e) {
      if (e instanceof SubmissionError) {
        await dbClient.query('COMMIT')
      } else {
        await dbClient.query('ROLLBACK')
      }

      throw e
    }
  }
}

const getTransformedLink = (originalUrl: URL): string => {
  let link = originalUrl.href
  if (originalUrl.host === 'twitter.com') {
    link = originalUrl.href.replace('twitter.com', 'vxtwitter.com')
  }
  if (originalUrl.host === 'x.com') {
    link = originalUrl.href.replace('x.com', 'vxtwitter.com')
  }

  if (link.includes('vxtwitter.com')) {
    if (link.includes('?')) link = link.slice(0, link.indexOf('?'))
    if (link.includes('/photo')) link = link.slice(0, link.indexOf('/photo'))
  }

  return link.trim()
}

const getNewTags = async (dbClient: Client, submissionId: number, tags: string[]): Promise<string[]> => {
  const existingTags = (await getTags(dbClient, submissionId)).rows
  existingTags.forEach(row => {
    if (tags.includes(row.tag)) {
      tags.splice(tags.indexOf(row.tag), 1)
    }
  })
  return tags
}
