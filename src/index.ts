import { type BaseInteraction, Events } from 'discord.js'
import { deployCommands } from './deploy-commands'
import { dbClient, discordClient } from './services'
import { type ExtendedApplicationCommand, type ExtendedClient } from './models/extends'

deployCommands()

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user!.tag}!`)
})

discordClient.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
  if (!interaction.isChatInputCommand()) return

  const command = await (interaction.client as ExtendedClient).commands!.get(interaction.commandName) as ExtendedApplicationCommand

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction, dbClient)
  } catch ({ name, message }) {
    console.error(message)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message as string, ephemeral: true })
    } else {
      await interaction.reply({ content: message as string, ephemeral: true })
    }
  }
})
