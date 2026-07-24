import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

type VoiceRecognitionModule = {
  start: (locale: string) => Promise<void>;
  stop: () => Promise<void>;
  cancel: () => Promise<void>;
  isAvailable: () => Promise<boolean>;
};

export type VoiceEvent = {
  transcript?: string;
  partial?: boolean;
  code?: number;
  message?: string;
};

const nativeModule = NativeModules.VoiceRecognition as
  | VoiceRecognitionModule
  | undefined;

export function getVoiceRecognition() {
  if (Platform.OS !== 'android' || !nativeModule) {
    return null;
  }

  return {
    module: nativeModule,
    events: new NativeEventEmitter(NativeModules.VoiceRecognition),
  };
}
