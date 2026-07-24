import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';

import {useAppTheme} from '../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../theme/tokens';
import {PressableScale} from './PressableScale';

export type SnackbarNotice = {
  id: number;
  message: string;
  onUndo: () => void;
};

type Props = {
  notice: SnackbarNotice | null;
  onDismiss: () => void;
};

export function UndoSnackbar({notice, onDismiss}: Props) {
  const {theme} = useAppTheme();
  const translateY = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    if (!notice) {
      return;
    }
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 22,
      bounciness: 3,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: 80,
        duration: 180,
        useNativeDriver: true,
      }).start(onDismiss);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notice, onDismiss, translateY]);

  if (!notice) {
    return null;
  }

  const undo = () => {
    notice.onUndo();
    onDismiss();
  };

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.text,
          transform: [{translateY}],
        },
      ]}>
      <Text style={[styles.message, {color: theme.colors.background}]}>
        {notice.message}
      </Text>
      <PressableScale
        accessibilityLabel={`Undo ${notice.message.toLowerCase()}`}
        onPress={undo}
        style={styles.undo}>
        <Text style={[styles.undoLabel, {color: theme.colors.primary}]}>UNDO</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radius.md,
    bottom: 90,
    elevation: 12,
    flexDirection: 'row',
    gap: spacing.lg,
    left: spacing.xl,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    position: 'absolute',
    right: spacing.xl,
  },
  message: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '700',
  },
  undo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  undoLabel: {
    fontSize: fontSize.caption,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
