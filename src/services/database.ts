import { Client } from 'pg'
import { dbConfigs } from '../config'

const { psqlHost, psqlPort, psqlUser, psqlPass, psqlDatabase } = dbConfigs

export const dbClient = new Client({
  host: psqlHost,
  port: psqlPort,
  database: psqlDatabase,
  user: psqlUser,
  password: psqlPass
})

dbClient.connect()
