import { SlashCommandBuilder } from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute (interaction: any) {
    console.log(interaction)
    await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`)
  }
}
