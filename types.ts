export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedImageResult {
  imageUrl: string;
  styleName: string;
}

export interface ProductPrompt {
  imageBase64: string;
  userDescription: string;
}