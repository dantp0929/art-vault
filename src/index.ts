import { type BaseInteraction, Events, type CommandInteraction, ModalSubmitInteraction } from 'discord.js'
import { dbClient, discordClient } from './services'
import { type ExtendedApplicationCommand, type ExtendedClient } from './models/Extensions'
import { deployCommands } from './deploy-commands'
import { editTagSubmission } from './services/commandHandlers/editTagSubmission'

deployCommands()

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user!.tag}!`)
})

discordClient.on(Events.InteractionCreate, async (interaction: any) => {
  if (!interaction.isChatInputCommand() 
    && !interaction.isContextMenuCommand() 
    && !interaction.isMessageContextMenuCommand() 
    && !interaction.isUserContextMenuCommand()
    && !interaction.isModalSubmit()) return

  if (interaction.isModalSubmit() && interaction.customId.includes(`tagModal-${interaction.user.id}`)) {
    const editedMessageLink = await editTagSubmission(interaction, dbClient)
    await interaction.reply({content: `Tags have been updated! ${editedMessageLink}`, ephemeral: true})
    return;
  }

  let command = await (interaction.client as ExtendedClient).commands!.get(interaction.commandName) as ExtendedApplicationCommand

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
        await interaction.followUp({ content: e.message, ephemeral: true })
      } else {
        await interaction.reply({ content: e.message, ephemeral: true })
      }
    }
  }
})
