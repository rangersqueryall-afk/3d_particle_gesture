
import { GestureType } from './types';

export const COLORS = {
  GOLD: '#FFD700',
  RED: '#FF4D4D',
  SILVER: '#C0C0C0',
  ORANGE: '#FFA500'
};

export const PARTICLE_COUNT = 8000;

export const GESTURE_MESSAGES: Record<GestureType, string> = {
  [GestureType.NONE]: "请展示手势来开启祝福...",
  [GestureType.HAPPY_NEW_YEAR]: "祝您 2026 马年：新春快乐，万事如意！",
  [GestureType.HORSE]: "龙马精神，快马加鞭！",
  [GestureType.LUCKY_HORSE]: "马到成功，大吉大利！",
  [GestureType.RED_ENVELOPE]: "恭喜发财，红包拿来！🧧"
};

export const GESTURE_ICONS: Record<GestureType, string> = {
  [GestureType.NONE]: "👋",
  [GestureType.HAPPY_NEW_YEAR]: "🏮",
  [GestureType.HORSE]: "🐎",
  [GestureType.LUCKY_HORSE]: "🍀",
  [GestureType.RED_ENVELOPE]: "🧧"
};

export const GESTURE_HINTS: Record<GestureType, string> = {
  [GestureType.NONE]: "等待识别",
  [GestureType.HAPPY_NEW_YEAR]: "双手合十 / 拱手",
  [GestureType.HORSE]: "比 V 手势 / 剪刀手",
  [GestureType.LUCKY_HORSE]: "竖大拇指",
  [GestureType.RED_ENVELOPE]: "手掌向上托起"
};
