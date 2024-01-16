import { Events, type Message } from 'discord.js'
import { deployCommands } from './deploy-commands'
import { dbClient, discordClient } from './services'
import { ExtendedApplicationCommand, ExtendedClient } from './models/extends';

deployCommands();

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user!.tag}!`)
})

discordClient.on('messageCreate', async (msg: Message) => {
  if (msg.content.startsWith('hello')) {
    await msg.reply('world!')
  }

  if (msg.content.startsWith('$')) {
    const result = await dbClient.query('SELECT * FROM public.submissions')
    console.log(result.rows)
  }
})

discordClient.on(Events.InteractionCreate, async (interaction: any) => {
  if (!interaction.isChatInputCommand()) return
  console.log(interaction)

  const command = await (interaction!.client as ExtendedClient).commands!.get(interaction.commandName) as ExtendedApplicationCommand

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
})
