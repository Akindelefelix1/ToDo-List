import {useCallback, useEffect, useRef, useState} from 'react';
import {PermissionsAndroid, Platform, type EmitterSubscription} from 'react-native';

import {getVoiceRecognition, type VoiceEvent} from './VoiceRecognition';

type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export function useVoiceRecognition(onResult: (transcript: string) => void) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const resultHandler = useRef(onResult);

  useEffect(() => {
    resultHandler.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const voice = getVoiceRecognition();
    if (!voice) {
      return;
    }

    const subscriptions: EmitterSubscription[] = [
      voice.events.addListener('voiceStart', () => setState('listening')),
      voice.events.addListener('voicePartial', (event: VoiceEvent) => {
        setTranscript(event.transcript ?? '');
      }),
      voice.events.addListener('voiceEnd', () => setState('processing')),
      voice.events.addListener('voiceResult', (event: VoiceEvent) => {
        const result = event.transcript?.trim() ?? '';
        setTranscript(result);
        setState('idle');
        if (result) {
          resultHandler.current(result);
        }
      }),
      voice.events.addListener('voiceError', (event: VoiceEvent) => {
        setError(event.message ?? 'Speech could not be recognized. Please try again.');
        setState('error');
      }),
    ];

    return () => subscriptions.forEach(subscription => subscription.remove());
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');

    if (Platform.OS !== 'android') {
      setError('Voice input is currently available on Android only.');
      setState('error');
      return;
    }

    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone access',
        message: 'Todo List uses your microphone only while you dictate tasks.',
        buttonPositive: 'Allow',
        buttonNegative: 'Not now',
      },
    );

    if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
      setError('Microphone permission is required for voice input.');
      setState('error');
      return;
    }

    const voice = getVoiceRecognition();
    if (!voice || !(await voice.module.isAvailable())) {
      setError('No speech recognition service is available on this device.');
      setState('error');
      return;
    }

    setState('processing');
    await voice.module.start('en-NG').catch(() => {
      setError('Voice input could not start. Please try again.');
      setState('error');
    });
  }, []);

  const stop = useCallback(async () => {
    setState('processing');
    await getVoiceRecognition()?.module.stop();
  }, []);

  const cancel = useCallback(async () => {
    await getVoiceRecognition()?.module.cancel();
    setState('idle');
    setTranscript('');
    setError(null);
  }, []);

  return {state, transcript, error, start, stop, cancel};
}
