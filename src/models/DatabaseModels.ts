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
