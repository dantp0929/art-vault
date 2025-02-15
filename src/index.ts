import { type BaseInteraction, Events } from 'discord.js'
import { dbClient, discordClient } from './services'
import { type ExtendedApplicationCommand, type ExtendedClient } from './models/Extensions'
import { deployCommands } from './deploy-commands'
import { editSubmission } from './services/commandHandlers/editSubmission'

deployCommands()

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user!.tag}!`)
})

discordClient.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
  if (interaction.isModalSubmit() && interaction.customId.includes(`editModal-${interaction.user.id}`)) {
    const editedMessageLink = await editSubmission(interaction, dbClient)
    await interaction.reply({ content: `Submission has been updated! ${editedMessageLink}`, flags: 'Ephemeral' })
    return
  }

  if (interaction.isChatInputCommand() ||
  interaction.isContextMenuCommand() ||
  interaction.isMessageContextMenuCommand() ||
  interaction.isUserContextMenuCommand()) {
    const command = await (interaction.client as ExtendedClient).commands!.get(interaction.commandName) as ExtendedApplicationCommand

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await command.execute(interaction, dbClient)
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: e.message, flags: 'Ephemeral' })
        } else {
          await interaction.reply({ content: e.message, flags: 'Ephemeral' })
        }
      }
    }
  }
})
