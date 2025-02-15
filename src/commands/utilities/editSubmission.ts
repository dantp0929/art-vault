import { ActionRowBuilder, ApplicationCommandType, ContextMenuCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, type MessageContextMenuCommandInteraction } from 'discord.js'
import { type Client } from 'pg'
import { getSpoilers, getSubmissionByDiscordMessageId, getTags } from '../../services/queries'

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Edit Submission')
    .setType(ApplicationCommandType.Message),
  async execute (interaction: MessageContextMenuCommandInteraction, dbClient: Client) {
    const existingSubmission = (await getSubmissionByDiscordMessageId(dbClient, interaction.targetId)).rows
    if (existingSubmission.length === 0) {
      throw new Error('Only submissions from the Art Vault bot can be edited!')
    }

    const existingTags = (await getTags(dbClient, existingSubmission[0].id)).rows.map(t => t.tag)
    const existingSpoilers = (await getSpoilers(dbClient, existingSubmission[0].id)).rows.map(s => s.spoiler)

    const modal = new ModalBuilder({
      customId: `editModal-${interaction.user.id}-${existingSubmission[0].id}`,
      title: 'Edit Submission'
    })

    const tagsInput = new TextInputBuilder({
      customId: 'tagsInput',
      label: 'tags',
      style: TextInputStyle.Short,
      value: existingTags.join(', ')
    })

    const spoilersInput = new TextInputBuilder({
      customId: 'spoilersInput',
      label: 'spoilers for',
      style: TextInputStyle.Short,
      value: existingSpoilers.join(', '),
      required: false
    })

    const tagActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tagsInput)
    const spoilerActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(spoilersInput)

    modal.addComponents(tagActionRow)
      .addComponents(spoilerActionRow)

    await interaction.showModal(modal)
  }
}
