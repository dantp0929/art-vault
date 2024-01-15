import { Client, Message } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN } = process.env;
const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"]
});

if (!DISCORD_TOKEN) {
  throw new Error("Missing environment variables");
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user!.tag}!`);
})

client.on('messageCreate', async (msg: Message) => {
  if (msg.content.startsWith("hello")) {
    msg.reply("world!");
  }
})

client.login(DISCORD_TOKEN);
