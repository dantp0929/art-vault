import { ApplicationCommand, Client, Collection } from "discord.js";

export interface ExtendedApplicationCommand extends ApplicationCommand {
  execute: Function
}

export interface ExtendedClient extends Client {
  commands?: Collection<unknown, unknown>
}