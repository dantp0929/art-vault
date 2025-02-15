import { type Client, type QueryResult } from 'pg'
import { type SubmissionTag, type Submission, type TopSubmitters, type SubmissionSpoiler } from '../models/DatabaseModels'

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

export const createSpoilers = async (dbClient: Client, submissionId: number, spoilers: string[]): Promise<void> => {
  spoilers = [...new Set(spoilers)]

  const queries: Array<Promise<QueryResult<SubmissionSpoiler>>> = []
  spoilers.forEach((spoiler: string) => {
    spoiler = spoiler.trim()
    queries.push(dbClient.query('INSERT INTO public.submission_spoilers(submission_id, spoiler) VALUES($1, $2)',
      [submissionId, spoiler]
    ))
  })
  await Promise.all(queries)
}

export const getTags = async (dbClient: Client, submissionId: number): Promise<QueryResult<SubmissionTag>> => {
  return await dbClient.query<SubmissionTag>('SELECT id, submission_id as "submissionId", tag FROM public.submission_tags WHERE submission_id = $1',
    [submissionId])
}

export const getSpoilers = async (dbClient: Client, submissionId: number): Promise<QueryResult<SubmissionSpoiler>> => {
  return await dbClient.query<SubmissionSpoiler>('SELECT id, submission_id as "submissionId", spoiler FROM public.submission_spoilers WHERE submission_id = $1',
    [submissionId])
}

export const deleteTags = async (dbClient: Client, submissionId: number): Promise<void> => {
  await dbClient.query('DELETE FROM public.submission_tags WHERE submission_id = $1', [submissionId])
}

export const deleteSpoilers = async (dbClient: Client, submissionId: number): Promise<void> => {
  await dbClient.query('DELETE FROM public.submission_spoilers WHERE submission_id = $1', [submissionId])
}

export const getTopTagSubmitters = async (dbClient: Client, tag: string, sinceDate: Date | null = null): Promise<QueryResult<TopSubmitters>> => {
  if (sinceDate == null) {
    return await dbClient.query('SELECT s.submitter, st.tag, COUNT(*) FROM public.submissions s LEFT JOIN public.submission_tags st ON s.id = st.submission_id WHERE tag ~* $1 GROUP BY s.submitter, st.tag ORDER BY count DESC',
      [tag])
  } else {
    return await dbClient.query('SELECT s.submitter, st.tag, COUNT(*) FROM public.submissions s LEFT JOIN public.submission_tags st ON s.id = st.submission_id WHERE tag ~* $1 AND s.created_on > $2 GROUP BY s.submitter, st.tag ORDER BY count DESC',
      [tag, sinceDate.toDateString()])
  }
}

export const getTopSubmitterTags = async (dbClient: Client, submitter: string, sinceDate: Date | null = null): Promise<QueryResult<TopSubmitters>> => {
  if (sinceDate == null) {
    return await dbClient.query('SELECT s.submitter, st.tag, COUNT(*) FROM public.submissions s LEFT JOIN public.submission_tags st ON s.id = st.submission_id WHERE s.submitter = $1 GROUP BY s.submitter, st.tag ORDER BY count DESC',
      [submitter])
  } else {
    return await dbClient.query('SELECT s.submitter, st.tag, COUNT(*) FROM public.submissions s LEFT JOIN public.submission_tags st ON s.id = st.submission_id WHERE s.submitter = $1 AND s.created_on > $2 GROUP BY s.submitter, st.tag ORDER BY count DESC',
      [submitter, sinceDate.toDateString()])
  }
}

export const getPostsWithTag = async (dbClient: Client, tag: string): Promise<QueryResult<Submission>> => {
  return await dbClient.query('SELECT submitter, external_link as "externalLink", discord_link as "discordLink" FROM public.submissions s LEFT JOIN public.submission_tags st ON s.id = st.submission_id WHERE st.tag = $1', [tag])
}
