import { type Message } from 'discord.js'
import { dbClient, discordClient } from './services'

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
