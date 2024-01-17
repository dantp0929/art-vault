import { SlashCommandBuilder } from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Submit an art piece!')
    .addStringOption(option =>
      option.setName('link')
        .setDescription('URL source of the art piece.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tags')
        .setDescription('Comma separated tags for the art piece.')),
  async execute (interaction: any) {
    // TODO: Add validations and sanitize
    try {
      const submitter = interaction.user.username
      const externalLink = interaction.options.getString('link')
      const tags = interaction.options.getString('tags')
      const createdOn = new Date().toISOString()

      const reply = await interaction.reply({ content: `${externalLink} - ${tags}`, fetchReply: true })

      const discordLink = `https://discord.com/channels/${reply.guildId}/${reply.channelId}/${reply.id}`

      return `INSERT INTO public.submissions(submitter, external_link, discord_link, created_on, updated_on) VALUES ('${submitter}', '${externalLink}', '${discordLink}', '${createdOn}', '${createdOn}')`
    } catch (e) {
      console.log(e)
    }
  }
}
