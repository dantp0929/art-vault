import { ActionRowBuilder, ApplicationCommandType, ContextMenuCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, type MessageContextMenuCommandInteraction } from 'discord.js'
import { type Client } from 'pg'
import { getSubmissionByDiscordMessageId, getTags } from '../../services/queries'

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Edit Tag')
    .setType(ApplicationCommandType.Message),
  async execute (interaction: MessageContextMenuCommandInteraction, dbClient: Client) {
    const existingSubmission = (await getSubmissionByDiscordMessageId(dbClient, interaction.targetId)).rows
    if (existingSubmission.length === 0) {
      throw new Error('Only tags of submissions from the Art Vault bot can be edited!')
    }

    const existingTags = (await getTags(dbClient, existingSubmission[0].id)).rows.map(t => t.tag)

    const modal = new ModalBuilder({
      customId: `tagModal-${interaction.user.id}-${existingSubmission[0].id}`,
      title: 'Edit Tags'
    })

    const tagsInput = new TextInputBuilder({
      customId: 'tagsInput',
      label: 'tags',
      style: TextInputStyle.Short,
      value: existingTags.join(', ')
    })

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tagsInput)

    modal.addComponents(actionRow)

    await interaction.showModal(modal)
  }
}
