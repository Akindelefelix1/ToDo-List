import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useAppTheme} from '../../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../../theme/tokens';
import type {TaskSectionKey} from '../types/task';

type Props = {
  title: string;
  count: number;
  sectionKey: TaskSectionKey;
};

export function TaskSectionHeader({title, count, sectionKey}: Props) {
  const {theme} = useAppTheme();
  const color =
    sectionKey === 'overdue'
      ? theme.colors.danger
      : sectionKey === 'completed'
        ? theme.colors.success
        : theme.colors.primary;

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={[styles.title, {color: theme.colors.text}]}>{title}</Text>
      <View style={[styles.count, {backgroundColor: `${color}16`}]}>
        <Text style={[styles.countLabel, {color}]}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  count: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
  },
  countLabel: {
    fontSize: 9,
    fontWeight: '900',
  },
  dot: {
    borderRadius: radius.pill,
    height: 7,
    width: 7,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: '900',
  },
});
