import { Client } from 'discord.js'
import { discordConfigs } from '../config'

const { discordToken } = discordConfigs

export const discordClient = new Client({
  intents: ['Guilds', 'GuildMessages', 'MessageContent']
})

discordClient.login(discordToken)
