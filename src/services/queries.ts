import { type Client, type QueryResult } from 'pg'
import { type SubmissionTag, type Submission } from '../models/DatabaseModels'

export const createSubmission = async (dbClient: Client, submitter: string, externalLink: string, discordLink: string, createdOn: string): Promise<QueryResult<Submission>> => {
  return await dbClient.query('INSERT INTO public.submissions(submitter, external_link, discord_link, created_on, updated_on) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [submitter, externalLink, discordLink, createdOn, createdOn])
}

export const getSubmissionByLink = async (dbClient: Client, externalLink: string): Promise<QueryResult<Submission>> => {
  return await dbClient.query<Submission>('SELECT id, submitter, external_link as "externalLink", discord_link as "discordLink", created_on as "createdOn", updated_on as "updatedOn" FROM public.submissions WHERE external_link = $1',
    [externalLink])
}

export const getSubmissionById = async (dbClient: Client, submissionId: number): Promise<QueryResult<Submission>> => {
  return await dbClient.query<Submission>('SELECT id, submitter, external_link as "externalLink", discord_link as "discordLink", created_on as "createdOn", updated_on as "updatedOn" FROM public.submissions WHERE id = $1',
    [submissionId])
}

export const getSubmissionByDiscordMessageId = async (dbClient: Client, discordMessageId: string): Promise<QueryResult<Submission>> => {
  return await dbClient.query<Submission>('SELECT id, submitter, external_link as "externalLink", discord_link as "discordLink", created_on as "createdOn", updated_on as "updatedOn" FROM public.submissions WHERE discord_link LIKE CONCAT(\'%\', $1::text)',
    [discordMessageId])
}

export const updateSubmission = async (dbClient: Client, id: number, discordLink: string, updatedOn: string): Promise<QueryResult<Submission>> => {
  return await dbClient.query('UPDATE public.submissions SET discord_link = $1, updated_on = $2 WHERE id = $3 RETURNING *',
    [discordLink, updatedOn, id])
}

export const createTags = async (dbClient: Client, submissionId: number, tags: string[]): Promise<void> => {
  tags = [...new Set(tags)]

  const queries: Array<Promise<QueryResult<SubmissionTag>>> = []
  tags.forEach((tag: string) => {
    tag = tag.trim()
    queries.push(dbClient.query('INSERT INTO public.submission_tags(submission_id, tag) VALUES($1, $2)',
      [submissionId, tag]
    ))
  })
  await Promise.all(queries)
}

export const getTags = async (dbClient: Client, submissionId: number): Promise<QueryResult<SubmissionTag>> => {
  return await dbClient.query<SubmissionTag>('SELECT id, submission_id as "submissionId", tag FROM public.submission_tags WHERE submission_id = $1',
    [submissionId])
}

export const deleteTags = async (dbClient: Client, submissionId: number): Promise<void> => {
  await dbClient.query('DELETE FROM public.submission_tags WHERE submission_id = $1', [submissionId])
}
