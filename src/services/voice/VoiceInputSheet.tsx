import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Check, Mic, Square, X} from 'lucide-react-native';

import {PressableScale} from '@/components/PressableScale';
import {useAppTheme} from '@/theme/ThemeProvider';
import {fontSize, radius, spacing} from '@/theme/tokens';

type Props = {
  visible: boolean;
  state: 'idle' | 'listening' | 'processing' | 'error';
  transcript: string;
  error: string | null;
  createdTasks: string[];
  onStart: () => void;
  onStop: () => void;
  onClose: () => void;
};

export function VoiceInputSheet({
  visible,
  state,
  transcript,
  error,
  createdTasks,
  onStart,
  onStop,
  onClose,
}: Props) {
  const {theme} = useAppTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== 'listening') {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, state]);

  const hasResult = createdTasks.length > 0;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Close voice input" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, {backgroundColor: theme.colors.surfaceElevated}]}>
          <View style={styles.handle} />
          <PressableScale
            accessibilityLabel="Close"
            onPress={onClose}
            style={[styles.close, {backgroundColor: theme.colors.background}]}>
            <X color={theme.colors.textMuted} size={17} />
          </PressableScale>

          <Animated.View
            style={[
              styles.micHalo,
              {
                backgroundColor: hasResult
                  ? `${theme.colors.success}20`
                  : theme.colors.primarySoft,
                transform: [{scale: pulse}],
              },
            ]}>
            {hasResult ? (
              <Check color={theme.colors.success} size={32} strokeWidth={3} />
            ) : (
              <Mic color={theme.colors.primary} size={32} />
            )}
          </Animated.View>

          <Text style={[styles.title, {color: theme.colors.text}]}>
            {hasResult
              ? `${createdTasks.length} ${
                  createdTasks.length === 1 ? 'task' : 'tasks'
                } added`
              : state === 'listening'
                ? 'Listening…'
                : state === 'processing'
                  ? 'Getting that down…'
                  : state === 'error'
                    ? 'Voice input paused'
                    : 'Add tasks by voice'}
          </Text>

          <Text style={[styles.hint, {color: theme.colors.textMuted}]}>
            {hasResult
              ? 'Your words were split into these tasks.'
              : 'Try “Buy provisions and call mom”.'}
          </Text>

          {transcript ? (
            <View style={[styles.transcript, {backgroundColor: theme.colors.background}]}>
              <Text style={[styles.transcriptText, {color: theme.colors.text}]}>
                “{transcript}”
              </Text>
            </View>
          ) : null}

          {error ? (
            <Text style={[styles.error, {color: theme.colors.danger}]}>{error}</Text>
          ) : null}

          {hasResult ? (
            <View style={styles.results}>
              {createdTasks.map((title, index) => (
                <View key={`${title}-${index}`} style={styles.resultRow}>
                  <View style={[styles.dot, {backgroundColor: theme.colors.success}]} />
                  <Text style={[styles.resultText, {color: theme.colors.text}]}>
                    {title}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <PressableScale
            onPress={
              hasResult
                ? onClose
                : state === 'listening'
                  ? onStop
                  : onStart
            }
            style={[
              styles.action,
              {
                backgroundColor:
                  state === 'listening' ? theme.colors.danger : theme.colors.primary,
              },
            ]}>
            {state === 'listening' ? (
              <Square color="#FFFFFF" fill="#FFFFFF" size={14} />
            ) : hasResult ? (
              <Check color="#FFFFFF" size={17} />
            ) : (
              <Mic color="#FFFFFF" size={17} />
            )}
            <Text style={styles.actionLabel}>
              {hasResult
                ? 'Done'
                : state === 'listening'
                  ? 'Finish speaking'
                  : 'Start listening'}
            </Text>
          </PressableScale>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.xl,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.body,
    fontWeight: '800',
  },
  close: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    width: 34,
  },
  dot: {
    borderRadius: radius.pill,
    height: 6,
    marginTop: 6,
    width: 6,
  },
  error: {
    fontSize: fontSize.caption,
    lineHeight: 16,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#D7D9E0',
    borderRadius: radius.pill,
    height: 4,
    marginBottom: spacing.xl,
    width: 42,
  },
  hint: {
    fontSize: fontSize.body,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  micHalo: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radius.pill,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  overlay: {
    backgroundColor: 'rgba(8,12,22,0.54)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  resultRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  resultText: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  results: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 410,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  transcript: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  transcriptText: {
    fontSize: fontSize.body,
    fontStyle: 'italic',
    lineHeight: 19,
    textAlign: 'center',
  },
});
