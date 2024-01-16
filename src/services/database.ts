import { Client } from 'pg'
import { dbConfigs } from '../config'

const { host, port, user, password, database } = dbConfigs

export const dbClient = new Client({
  host,
  port,
  database,
  user,
  password
})

dbClient.connect()
