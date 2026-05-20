export interface Message {
  id: string
  question: string
  answer: string
  timestamp: number
}

export interface ApiError {
  message: string
  code?: number
}
