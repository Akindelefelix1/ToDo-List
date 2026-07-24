import React, {useCallback, useMemo, useRef} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Check, Pencil, Trash2} from 'lucide-react-native';

import {triggerHaptic} from '../utils/haptics';
import {PressableScale} from './PressableScale';

type Props = {
  children: React.ReactNode;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function SwipeActions({
  children,
  onComplete,
  onEdit,
  onDelete,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;

  const close = useCallback(() => {
    translateX.stopAnimation();
    Animated.spring(translateX, {
      toValue: 0,
      // PanResponder updates this value on the JS thread. Keeping the spring
      // on the same driver prevents mixed-driver errors on later swipes.
      useNativeDriver: false,
      speed: 24,
      bounciness: 2,
    }).start();
  }, [translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          translateX.stopAnimation();
          translateX.setValue(Math.max(-108, Math.min(76, gesture.dx)));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 54) {
            close();
            triggerHaptic('success');
            onComplete();
          } else if (gesture.dx < -48) {
            translateX.stopAnimation();
            Animated.spring(translateX, {
              toValue: -108,
              useNativeDriver: false,
              speed: 24,
              bounciness: 2,
            }).start();
          } else {
            close();
          }
        },
        onPanResponderTerminate: () => close(),
      }),
    [close, onComplete, translateX],
  );

  const action = (callback: () => void) => {
    close();
    callback();
  };

  return (
    <View style={styles.container}>
      <View style={styles.completeAction}>
        <Check color="#FFFFFF" size={18} strokeWidth={3} />
        <Text style={styles.actionLabel}>Done</Text>
      </View>
      <View style={styles.rightActions}>
        <PressableScale
          accessibilityLabel="Edit task"
          onPress={() => action(onEdit)}
          style={[styles.actionButton, styles.editAction]}>
          <Pencil color="#FFFFFF" size={17} />
        </PressableScale>
        <PressableScale
          accessibilityLabel="Delete task"
          onPress={() => action(onDelete)}
          style={[styles.actionButton, styles.deleteAction]}>
          <Trash2 color="#FFFFFF" size={17} />
        </PressableScale>
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.foreground, {transform: [{translateX}]}]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: 54,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  completeAction: {
    alignItems: 'center',
    backgroundColor: '#31B77B',
    bottom: 0,
    gap: 2,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 76,
  },
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  deleteAction: {
    backgroundColor: '#E85D75',
  },
  editAction: {
    backgroundColor: '#5B5CE2',
  },
  foreground: {
    zIndex: 1,
  },
  rightActions: {
    bottom: 0,
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
