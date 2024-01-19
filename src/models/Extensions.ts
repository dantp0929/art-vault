import { type BaseInteraction, type ApplicationCommand, type Client, type Collection } from 'discord.js'
import { type Client as DbClient } from 'pg'

export interface ExtendedApplicationCommand extends ApplicationCommand {
  execute: (interaction: BaseInteraction, dbClient?: DbClient) => Promise<string>
}

export interface ExtendedClient extends Client {
  commands?: Collection<unknown, unknown>
}
