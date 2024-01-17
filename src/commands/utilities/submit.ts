import { SlashCommandBuilder } from 'discord.js'
import { type Client } from 'pg'

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
    // TODO: Add validations and sanitize
    try {
      const submitter = interaction.user.username
      const externalLink = getTransformedLink(new URL(interaction.options.getString('link'))) // eslint-disable-line @typescript-eslint/no-unsafe-argument
      const tags = interaction.options.getString('tags')
      const createdOn = new Date().toISOString()

      const existing = await dbClient.query(`SELECT discord_link FROM public.submissions WHERE external_link = '${externalLink}'`)
      if (existing.rowCount! > 0) {
        throw new Error(`This link has already been submitted: ${existing.rows[0].discord_link}`)
      }

      // Send a reply and retrieve the link
      const reply = await interaction.reply({
        content: `${externalLink} - ${tags}`,
        fetchReply: true
      })
      const discordLink = `https://discord.com/channels/${reply.guildId}/${reply.channelId}/${reply.id}`

      // Insert into submissions and submission_tags tables
      await dbClient.query('BEGIN')
      const submission = await dbClient.query(`INSERT INTO public.submissions(submitter, external_link, discord_link, created_on, updated_on) VALUES ('${submitter}', '${externalLink}', '${discordLink}', '${createdOn}', '${createdOn}') RETURNING id`)

      const tagArray = tags.split(',')
      tagArray.forEach(async (tag: string) => {
        tag = tag.trim().toLowerCase()
        await dbClient.query(`INSERT INTO public.submission_tags(submission_id, tag) VALUES('${submission.rows[0].id}', '${tag}')`)
      })
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
  return link
}
