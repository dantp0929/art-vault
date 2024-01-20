import { REST, Routes } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import { discordConfigs } from './config'

const { token, clientId, guildIds } = discordConfigs

const commands: any[] = []
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'))
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath) // eslint-disable-line @typescript-eslint/no-var-requires
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON())
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token)

// and deploy your commands!
export const deployCommands = async (): Promise<void> => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    const datas: Array<Promise<any>> = []
    guildIds.split(',').forEach(guildId => {
      // The put method is used to fully refresh all commands in the guild with the current set
      datas.push(rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      ))
    })
    await Promise.all(datas)

    console.log(`Finished refreshing ${commands.length} application (/) commands.`)
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
}

deployCommands()
