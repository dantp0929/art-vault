export interface Submission {
  id: number
  submitter: string
  externalLink: string
  discordLink: string
  createdOn: string
  updatedOn: string
}

export interface SubmissionTag {
  id: number
  submissionId: number
  tag: string
}

export interface SubmissionSpoiler {
  id: number
  submissionId: number
  spoiler: string
}

export interface TopSubmitters {
  submitter: string
  tag: string
  count: number
}
