import { type BaseInteraction, Events } from 'discord.js'
import { dbClient, discordClient } from './services'
import { type ExtendedApplicationCommand, type ExtendedClient } from './models/Extensions'

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
