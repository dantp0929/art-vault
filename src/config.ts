import dotenv from 'dotenv'

dotenv.config()

interface DiscordConfig {
  token: string
  clientId: string
  guildId: string
}

interface DbConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, PSQL_HOST, PSQL_PORT, PSQL_USER, PSQL_PASS, PSQL_DATABASE } = process.env

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_ID) {
  throw new Error('Missing Discord configuration variables.')
}

if (!PSQL_HOST || !PSQL_PORT || !PSQL_USER || !PSQL_PASS || !PSQL_DATABASE) {
  throw new Error('Missing database configuration variables.')
}

export const discordConfigs: DiscordConfig = {
  token: DISCORD_TOKEN,
  clientId: DISCORD_CLIENT_ID,
  guildId: DISCORD_GUILD_ID
}

export const dbConfigs: DbConfig = {
  host: PSQL_HOST,
  port: parseInt(PSQL_PORT, 10),
  user: PSQL_USER,
  password: PSQL_PASS,
  database: PSQL_DATABASE
}
