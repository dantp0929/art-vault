import { type Client } from 'pg'
import { AsciiTable3 } from 'ascii-table3'
import { SlashCommandBuilder } from 'discord.js'
import { getTopTagSubmitters } from '../../services/queries'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top-submitter')
    .setDescription('Search for the top submitters of a tag.')
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

    const queryResults = (await getTopTagSubmitters(dbClient, tag)).rows
    if (queryResults.length === 0) throw new Error(`There are no tags that match '${tag}'.`)

    const table = new AsciiTable3(`Top Submitters for '${tag}'`)
      .setStyle('unicode-single')
      .setHeading('Submitter', 'Tag', 'Count')

    queryResults.forEach(row => {
      table.addRow(row.submitter, row.tag, row.count)
    })

    await interaction.reply({
      content: '```\n' + table.toString() + '```',
      fetchReply: true,
      ephemeral: !interaction.options.getBoolean('public')
    })
  }
}
