import { type BaseInteraction, type ApplicationCommand, type Client, type Collection } from 'discord.js'

export interface ExtendedApplicationCommand extends ApplicationCommand {
  execute: (interaction: BaseInteraction) => Promise<string>
}

export interface ExtendedClient extends Client {
  commands?: Collection<unknown, unknown>
}
