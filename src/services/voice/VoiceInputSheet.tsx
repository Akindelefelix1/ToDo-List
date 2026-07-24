import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Check, Mic, Square, Trash2, X} from 'lucide-react-native';

import {PressableScale} from '../../components/PressableScale';
import {useAppTheme} from '../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../theme/tokens';

type Props = {
  visible: boolean;
  state: 'idle' | 'listening' | 'processing' | 'error';
  transcript: string;
  error: string | null;
  suggestedTasks: string[];
  onStart: () => void;
  onStop: () => void;
  onClose: () => void;
  onChangeTask: (index: number, value: string) => void;
  onRemoveTask: (index: number) => void;
  onConfirm: () => void;
};

export function VoiceInputSheet({
  visible,
  state,
  transcript,
  error,
  suggestedTasks,
  onStart,
  onStop,
  onClose,
  onChangeTask,
  onRemoveTask,
  onConfirm,
}: Props) {
  const {theme} = useAppTheme();
  const pulse = useRef(new Animated.Value(1)).current;
  const hasSuggestions = suggestedTasks.length > 0;
  const validCount = suggestedTasks.filter(title => title.trim()).length;

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

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close voice input"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
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
                backgroundColor: hasSuggestions
                  ? `${theme.colors.success}20`
                  : theme.colors.primarySoft,
                transform: [{scale: pulse}],
              },
            ]}>
            {hasSuggestions ? (
              <Check color={theme.colors.success} size={32} strokeWidth={3} />
            ) : (
              <Mic color={theme.colors.primary} size={32} />
            )}
          </Animated.View>

          <Text style={[styles.title, {color: theme.colors.text}]}>
            {hasSuggestions
              ? 'Review your tasks'
              : state === 'listening'
                ? 'Listening…'
                : state === 'processing'
                  ? 'Getting that down…'
                  : state === 'error'
                    ? 'Voice input paused'
                    : 'Add tasks by voice'}
          </Text>
          <Text style={[styles.hint, {color: theme.colors.textMuted}]}>
            {hasSuggestions
              ? 'Edit or remove anything before adding it.'
              : 'Try “Buy provisions and call mom”.'}
          </Text>

          {transcript && !hasSuggestions ? (
            <View style={[styles.transcript, {backgroundColor: theme.colors.background}]}>
              <Text style={[styles.transcriptText, {color: theme.colors.text}]}>
                “{transcript}”
              </Text>
            </View>
          ) : null}

          {error ? (
            <Text style={[styles.error, {color: theme.colors.danger}]}>{error}</Text>
          ) : null}

          {hasSuggestions ? (
            <ScrollView
              contentContainerStyle={styles.results}
              keyboardShouldPersistTaps="handled"
              style={styles.resultsScroll}>
              {suggestedTasks.map((title, index) => (
                <View key={`voice-task-${index}`} style={styles.resultRow}>
                  <TextInput
                    accessibilityLabel={`Voice task ${index + 1}`}
                    maxLength={80}
                    onChangeText={value => onChangeTask(index, value)}
                    placeholder="Task title"
                    placeholderTextColor={theme.colors.textMuted}
                    style={[
                      styles.resultInput,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                      },
                    ]}
                    value={title}
                  />
                  <PressableScale
                    accessibilityLabel={`Remove voice task ${index + 1}`}
                    onPress={() => onRemoveTask(index)}
                    style={styles.removeButton}>
                    <Trash2 color={theme.colors.danger} size={16} />
                  </PressableScale>
                </View>
              ))}
            </ScrollView>
          ) : null}

          <PressableScale
            disabled={hasSuggestions && validCount === 0}
            onPress={
              hasSuggestions
                ? onConfirm
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
            ) : hasSuggestions ? (
              <Check color="#FFFFFF" size={17} />
            ) : (
              <Mic color="#FFFFFF" size={17} />
            )}
            <Text style={styles.actionLabel}>
              {hasSuggestions
                ? `Add ${validCount} ${validCount === 1 ? 'task' : 'tasks'}`
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
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  overlay: {
    backgroundColor: 'rgba(8,12,22,0.54)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  removeButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 32,
  },
  resultInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    fontSize: fontSize.body,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  results: {
    gap: spacing.sm,
  },
  resultsScroll: {
    marginTop: spacing.lg,
    maxHeight: 190,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 390,
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
