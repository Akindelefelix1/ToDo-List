import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {CheckCircle2} from 'lucide-react-native';

import {useAppTheme} from '@/theme/ThemeProvider';
import {fontSize, radius, spacing} from '@/theme/tokens';

type Props = {
  completed: number;
  total: number;
};

export function TaskProgress({completed, total}: Props) {
  const {theme} = useAppTheme();
  const progress = total === 0 ? 0 : completed / total;
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, progress]);

  const width = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.primary}]}>
      <View style={styles.row}>
        <View>
          <Text style={styles.eyebrow}>TODAY'S PROGRESS</Text>
          <Text style={styles.value}>
            {completed} of {total} complete
          </Text>
        </View>
        <View style={styles.icon}>
          <CheckCircle2 color="#FFFFFF" size={22} />
        </View>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, {width}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  fill: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    height: '100%',
  },
  icon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.pill,
    height: 5,
    overflow: 'hidden',
  },
  value: {
    color: '#FFFFFF',
    fontSize: fontSize.bodyLarge,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
});
