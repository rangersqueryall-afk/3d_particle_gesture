
export enum GestureType {
  NONE = 'NONE',
  HAPPY_NEW_YEAR = '新春快乐',
  HORSE = '马',
  LUCKY_HORSE = '马年大吉',
  RED_ENVELOPE = '红包拿来'
}

export interface ParticleConfig {
  count: number;
  size: number;
  color: string;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}
