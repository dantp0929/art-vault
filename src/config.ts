import dotenv from 'dotenv'

dotenv.config()

interface DiscordConfig {
  discordToken: string
}

interface DbConfig {
  psqlHost: string
  psqlPort: number
  psqlUser: string
  psqlPass: string
  psqlDatabase: string
}

const { DISCORD_TOKEN, PSQL_HOST, PSQL_PORT, PSQL_USER, PSQL_PASS, PSQL_DATABASE } = process.env

if (!DISCORD_TOKEN) {
  throw new Error('Missing Discord configuration variables.')
}

if (!PSQL_HOST || !PSQL_PORT || !PSQL_USER || !PSQL_PASS || !PSQL_DATABASE) {
  throw new Error('Missing database configuration variables.')
}

export const discordConfigs: DiscordConfig = {
  discordToken: DISCORD_TOKEN
}

export const dbConfigs: DbConfig = {
  psqlHost: PSQL_HOST,
  psqlPort: parseInt(PSQL_PORT, 10),
  psqlUser: PSQL_USER,
  psqlPass: PSQL_PASS,
  psqlDatabase: PSQL_DATABASE
}
