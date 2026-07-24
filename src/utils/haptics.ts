import {Platform, Vibration} from 'react-native';

export function triggerHaptic(kind: 'light' | 'success' = 'light') {
  if (Platform.OS === 'android') {
    Vibration.vibrate(kind === 'success' ? [0, 22, 45, 28] : 18);
  }
}
