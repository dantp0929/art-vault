import { type Client } from 'pg'
import { SlashCommandBuilder } from 'discord.js'
import { createSubmission, createTags, getSubmissionByLink, getTags } from '../../services/queries'

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
      const tags = ((interaction.options.getString('tags') as string) ?? '').split(',').map(tag => tag.trim())
      const createdOn = new Date().toISOString()

      const existingSubmissions = await getSubmissionByLink(dbClient, externalLink)
      if (existingSubmissions.rowCount! > 0) {
        const existingSubmission = existingSubmissions.rows[0]
        const existingTags = await getTags(dbClient, existingSubmission.id)
        console.log(tags)
        existingTags.rows.forEach(row => {
          if (tags.includes(row.tag)) {
            tags.splice(tags.indexOf(row.tag), 1)
          }
        })

        if (tags.length > 0) {
          createTags(dbClient, existingSubmission.id, tags)
          throw new Error(`This link has already been submitted: ${existingSubmission.discordLink} \nTags have been updated.`)
        }
        throw new Error(`This link has already been submitted: ${existingSubmission.discordLink}`)
      }

      // Send a reply and retrieve the link
      const reply = await interaction.reply({
        content: tags.length > 0 ? `${externalLink} - ${tags.join(', ')}` : externalLink,
        fetchReply: true
      })
      const discordLink = `https://discord.com/channels/${reply.guildId}/${reply.channelId}/${reply.id}`

      // Insert into submissions and submission_tags tables
      await dbClient.query('BEGIN')
      const submission = await createSubmission(dbClient, submitter, externalLink, discordLink, createdOn)
      createTags(dbClient, submission.rows[0].id, tags)
      await dbClient.query('COMMIT')
    } catch (e) {
      console.log(e)
      await dbClient.query('ROLLBACK')

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
  return link.trim()
}
