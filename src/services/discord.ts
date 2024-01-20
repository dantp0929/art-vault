import fs from 'node:fs'
import path from 'node:path'
import { discordConfigs } from '../config'
import { Client, Collection, GatewayIntentBits } from 'discord.js'
import { type ExtendedClient } from '../models/Extensions'

const { token } = discordConfigs

export const discordClient: ExtendedClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

discordClient.commands = new Collection()

const foldersPath = path.join(__dirname, '../commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'))
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath) // eslint-disable-line @typescript-eslint/no-var-requires
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      discordClient.commands.set(command.data.name, command)
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
    }
  }
}

discordClient.login(token)
