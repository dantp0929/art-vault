export class SubmissionError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'SubmissionError'
  }
}
