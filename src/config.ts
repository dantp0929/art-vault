import dotenv from 'dotenv'

// eslint-disable-next-line n/no-path-concat
dotenv.config({ path: __dirname + '/.env' })

interface DiscordConfig {
  token: string
  clientId: string
  guildIds: string
}

interface DbConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_IDS, PSQL_HOST, PSQL_PORT, PSQL_USER, PSQL_PASS, PSQL_DATABASE } = process.env

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_IDS) {
  throw new Error('Missing Discord configuration variables.')
}

if (!PSQL_HOST || !PSQL_PORT || !PSQL_USER || !PSQL_PASS || !PSQL_DATABASE) {
  throw new Error('Missing database configuration variables.')
}

export const discordConfigs: DiscordConfig = {
  token: DISCORD_TOKEN,
  clientId: DISCORD_CLIENT_ID,
  guildIds: DISCORD_GUILD_IDS
}

export const dbConfigs: DbConfig = {
  host: PSQL_HOST,
  port: parseInt(PSQL_PORT, 10),
  user: PSQL_USER,
  password: PSQL_PASS,
  database: PSQL_DATABASE
}
