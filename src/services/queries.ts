import { type Client, type QueryResult } from 'pg'
import { type SubmissionTag, type Submission } from '../models/DatabaseModels'

export const getSubmissionByLink = async (dbClient: Client, externalLink: string): Promise<QueryResult<Submission>> => {
  return await dbClient.query<Submission>('SELECT id, submitter, external_link as "externalLink", discord_link as "discordLink", created_on as "createdOn", updated_on as "updatedOn" FROM public.submissions WHERE external_link = $1',
    [externalLink])
}

export const createSubmission = async (dbClient: Client, submitter: string, externalLink: string, discordLink: string, createdOn: string): Promise<QueryResult<Submission>> => {
  return await dbClient.query('INSERT INTO public.submissions(submitter, external_link, discord_link, created_on, updated_on) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [submitter, externalLink, discordLink, createdOn, createdOn])
}

export const getTags = async (dbClient: Client, submissionId: number): Promise<QueryResult<SubmissionTag>> => {
  return await dbClient.query<SubmissionTag>('SELECT id, submission_id as "submissionId", tag FROM public.submission_tags WHERE submission_id = $1',
    [submissionId])
}

export const createTags = (dbClient: Client, submissionId: number, tags: string[]): void => {
  tags = [...new Set(tags)]

  const queries: Array<Promise<QueryResult<SubmissionTag>>> = []
  tags.forEach((tag: string) => {
    tag = tag.trim().toLowerCase()
    queries.push(dbClient.query('INSERT INTO public.submission_tags(submission_id, tag) VALUES($1, $2)',
      [submissionId, tag]
    ))
  })
  Promise.all(queries)
}
