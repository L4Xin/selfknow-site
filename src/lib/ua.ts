export type UAInfo = {
  isWeChat: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  needsLongPressHint: boolean;
};

export function parseUA(ua: string): UAInfo {
  const isWeChat = /MicroMessenger/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const needsLongPressHint = isWeChat && isMobile;
  return { isWeChat, isIOS, isAndroid, isMobile, needsLongPressHint };
}
