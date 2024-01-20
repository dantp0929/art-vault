import { type ModalSubmitInteraction } from 'discord.js'
import { type Client } from 'pg'
import { createTags, deleteTags, getSubmissionById } from '../queries'

export const editTagSubmission = async (interaction: ModalSubmitInteraction, dbClient: Client): Promise<string | undefined> => {
  try {
    if (!interaction.isModalSubmit()) return

    await dbClient.query('BEGIN')
    const submissionId = parseInt(interaction.customId.split('-').at(2)!, 10)
    const tags = interaction.fields.getField('tagsInput').value.split(',').map(t => t.trim()).filter(t => !!t)

    await deleteTags(dbClient, submissionId)

    if (tags.length > 0) { await createTags(dbClient, submissionId, tags) }

    const existingSubmission = (await getSubmissionById(dbClient, submissionId)).rows[0]
    const existingMessageId = existingSubmission.discordLink.split('/').at(6)!
    const existingMessage = await interaction.channel?.messages.fetch(existingMessageId).catch((e: any) => { console.log(e) })

    const editedMessage = tags.length > 0 ? `${existingSubmission.externalLink} - ${tags.join(', ')}` : existingSubmission.externalLink
    existingMessage?.edit(editedMessage)

    await dbClient.query('COMMIT')

    return existingSubmission.discordLink
  } catch (e) {
    await dbClient.query('ROLLBACK')
    throw e
  }
}
