import { type Client } from 'pg'
import { AsciiTable3 } from 'ascii-table3'
import { SlashCommandBuilder } from 'discord.js'
import { getTopSubmitterTags } from '../../services/queries'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top-tag')
    .setDescription('Search for the top tags of a submitter.')
    .addStringOption(option =>
      option.setName('submitter')
        .setDescription('Submitter of tags to search for.')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('public')
        .setDescription('Show the results to everyone.')
        .setRequired(false)
    ),
  async execute (interaction: any, dbClient: Client) {
    const submitter = (interaction.options.getString('submitter') as string) ?? ''

    const queryResults = (await getTopSubmitterTags(dbClient, submitter)).rows
    if (queryResults.length === 0) throw new Error(`There are no submitters that match '${submitter}'.`)

    const table = new AsciiTable3(`Top 20 Tags for '${submitter}'`)
      .setStyle('unicode-single')
      .setHeading('Tag', 'Count')

    for (const [i, row] of queryResults.entries()) {
      if (i > 20) break
      table.addRow(row.tag, row.count)
    }

    await interaction.reply({
      content: '```\n' + table.toString() + '```',
      fetchReply: true,
      ephemeral: !interaction.options.getBoolean('public') ?? true
    })
  }
}
