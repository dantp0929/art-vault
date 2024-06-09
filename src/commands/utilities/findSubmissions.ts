import { type Client } from 'pg'
import { SlashCommandBuilder } from 'discord.js'
import { getPostsWithTag } from '../../services/queries'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('find-submissions')
    .setDescription('Find submissions of a tag.')
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('Tag of submissions to search for.')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('public')
        .setDescription('Show the results to everyone.')
        .setRequired(false)
    ),
  async execute (interaction: any, dbClient: Client) {
    const tag = (interaction.options.getString('tag') as string) ?? ''

    const queryResults = (await getPostsWithTag(dbClient, tag)).rows
    if (queryResults.length === 0) throw new Error(`There are no tags that exactly match '${tag}'.`)

    let response = ''
    let isFirstReply = true
    for (const [i, row] of queryResults.entries()) {
      response += `${row.discordLink} - ${row.submitter} - <${row.externalLink}>\n`

      if (i % 10 === 0 || i === queryResults.length - 1) {
        if (isFirstReply) {
          await interaction.reply({
            content: response,
            fetchReply: true,
            ephemeral: !interaction.options.getBoolean('public') ?? true
          })
          isFirstReply = false
        } else {
          await interaction.followUp({
            content: response,
            fetchReply: true,
            ephemeral: !interaction.options.getBoolean('public') ?? true
          })
        }
        response = ''
      }
    }
  }
}
