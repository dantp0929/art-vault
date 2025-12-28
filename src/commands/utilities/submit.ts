import { type Client } from 'pg'
import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { createSpoilers, createSubmission, createTags, getSpoilers, getSubmissionByLink, getTags, updateSubmission } from '../../services/queries'
import { SubmissionError } from '../../models/Errors'
import { buildMessage } from '../../services/commandHandlers/buildMessage'

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
        .setDescription('Comma separated tags for the art piece.'))
    .addStringOption(option =>
      option.setName('spoilers')
        .setDescription('Is this a spoiler for something?')
    ),
  async execute(interaction: ChatInputCommandInteraction, dbClient: Client) {
    try {
      const submitter: string = interaction.user.username
      const externalLink = await getTransformedLink(new URL(interaction.options.getString('link', true)))
      let tags = ((interaction.options.getString('tags')) ?? '').split(',').map(tag => tag.trim()).filter(tag => !!tag)
      let spoilers = ((interaction.options.getString('spoilers')) ?? '').split(',').map(spoiler => spoiler.trim()).filter(spoiler => !!spoiler)
      const currentTime = new Date().toISOString()

      const existingSubmission = (await getSubmissionByLink(dbClient, externalLink)).rows[0]

      await dbClient.query('BEGIN')

      if (existingSubmission) {
        const existingMessageId = existingSubmission.discordLink.split('/').at(6)!
        const existingMessage = await interaction.channel!.messages.fetch(existingMessageId).catch((e: any) => { console.log(e) })

        const existingTags = (await getTags(dbClient, existingSubmission.id)).rows
        const existingSpoilers = (await getSpoilers(dbClient, existingSubmission.id)).rows
        const newTags = tags
        const newSpoilers = spoilers
        existingTags.forEach(row => {
          if (newTags.includes(row.tag)) {
            newTags.splice(newTags.indexOf(row.tag), 1)
          }
        })

        existingSpoilers.forEach(row => {
          if (newSpoilers.includes(row.spoiler)) {
            newSpoilers.splice(newTags.indexOf(row.spoiler), 1)
          }
        })

        // The submission's latest post still exists
        if (existingMessage !== undefined) {
          if (newTags.length > 0) {
            await createTags(dbClient, existingSubmission.id, newTags)
            newTags.push(...existingTags.map(r => r.tag))
          }
          if (newSpoilers.length > 0) {
            await createSpoilers(dbClient, existingSubmission.id, newSpoilers)
            newSpoilers.push(...existingSpoilers.map(r => r.spoiler))
          }
          if (newTags.length > 0 || newSpoilers.length > 0) {
            existingMessage.edit(buildMessage(externalLink, newTags, newSpoilers))
            throw new SubmissionError(`This link has already been submitted: ${existingSubmission.discordLink}\nSubmission has been updated.`)
          }
          throw new Error(`This link has already been submitted: ${existingSubmission.discordLink}\nhttps://tenor.com/view/cringe-gif-24107071`)
        }
        tags = [...newTags, ...existingTags.map(r => r.tag)]
        spoilers = [...newSpoilers, ...existingSpoilers.map(r => r.spoiler)]
      }

      // Send a reply and retrieve the link
      const reply = await interaction.reply({
        content: buildMessage(externalLink, tags, spoilers),
        withResponse: true
      })
      const discordLink = `https://discord.com/channels/${reply.resource?.message?.guildId}/${reply.resource?.message?.channelId}/${reply.resource?.message?.id}`

      // Insert into submissions and submission_tags tables
      if (existingSubmission) {
        await updateSubmission(dbClient, existingSubmission.id, discordLink, currentTime)
        const newTags = await getNewTags(dbClient, existingSubmission.id, tags)
        const newSpoilers = await getNewSpoilers(dbClient, existingSubmission.id, spoilers)
        await createTags(dbClient, existingSubmission.id, newTags)
        await createSpoilers(dbClient, existingSubmission.id, newSpoilers)
      } else {
        const submission = await createSubmission(dbClient, submitter, externalLink, discordLink, currentTime)
        await createTags(dbClient, submission.rows[0].id, tags)
        await createSpoilers(dbClient, submission.rows[0].id, spoilers)
      }

      await dbClient.query('COMMIT')
    } catch (e) {
      if (e instanceof SubmissionError) {
        await dbClient.query('COMMIT')
      } else {
        await dbClient.query('ROLLBACK')
      }

      throw e
    }
  }
}

const getTransformedLink = async (originalUrl: URL): Promise<string> => {
  let link = originalUrl.href
  if (originalUrl.host === 'twitter.com') {
    link = originalUrl.href.replace('twitter.com', 'vxtwitter.com')
  }
  if (originalUrl.host === 'x.com') {
    link = originalUrl.href.replace('x.com', 'vxtwitter.com')
  }

  if (link.includes('vxtwitter.com')) {
    if (link.includes('?')) link = link.slice(0, link.indexOf('?'))
    if (link.includes('/photo')) link = link.slice(0, link.indexOf('/photo'))

    if (link.includes('/i/')) {
      const apiResult = await (await fetch(link.replace('vxtwitter.com', 'api.vxtwitter.com'))).text()
      link = JSON.parse(apiResult).tweetURL;
      link = link.replace('twitter.com', 'vxtwitter.com');
    }
  }

  return link.trim()
}

const getNewTags = async (dbClient: Client, submissionId: number, tags: string[]): Promise<string[]> => {
  const existingTags = (await getTags(dbClient, submissionId)).rows
  existingTags.forEach(row => {
    if (tags.includes(row.tag)) {
      tags.splice(tags.indexOf(row.tag), 1)
    }
  })
  return tags
}

const getNewSpoilers = async (dbClient: Client, submissionId: number, spoilers: string[]): Promise<string[]> => {
  const existingSpoilers = (await getSpoilers(dbClient, submissionId)).rows
  existingSpoilers.forEach(row => {
    if (spoilers.includes(row.spoiler)) {
      spoilers.splice(spoilers.indexOf(row.spoiler), 1)
    }
  })
  return spoilers
}
