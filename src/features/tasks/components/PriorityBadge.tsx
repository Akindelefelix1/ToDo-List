import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Flag} from 'lucide-react-native';

import {useAppTheme} from '../../../theme/ThemeProvider';
import {radius, spacing} from '../../../theme/tokens';
import type {TaskPriority} from '../types/task';

type Props = {
  priority: TaskPriority;
  compact?: boolean;
};

const labels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function PriorityBadge({priority, compact = false}: Props) {
  const {theme} = useAppTheme();
  const color =
    priority === 'high'
      ? theme.colors.danger
      : priority === 'medium'
        ? theme.colors.accent
        : theme.colors.success;

  return (
    <View style={[styles.badge, compact && styles.compact, {backgroundColor: `${color}18`}]}>
      <Flag color={color} fill={`${color}28`} size={compact ? 9 : 11} />
      {!compact ? (
        <Text style={[styles.label, {color}]}>{labels[priority]}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  compact: {
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
