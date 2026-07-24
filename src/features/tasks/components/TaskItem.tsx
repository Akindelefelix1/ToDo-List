import React, {useEffect, useRef} from 'react';
import {Animated, LayoutAnimation, StyleSheet, Text, View} from 'react-native';
import {CalendarDays, Check, Trash2} from 'lucide-react-native';

import {PressableScale} from '@/components/PressableScale';
import {useAppTheme} from '@/theme/ThemeProvider';
import {fontSize, radius, spacing} from '@/theme/tokens';
import {formatDueDate, isOverdue} from '@/utils/date';

import type {Task} from '../types/task';

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
};

export function TaskItem({task, onToggle, onDelete}: Props) {
  const {theme} = useAppTheme();
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 5,
    }).start();
  }, [entrance]);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const overdue = !task.completed && isOverdue(task.dueDate);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
      }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: task.completed ? theme.colors.success : theme.colors.border,
          },
        ]}>
        <PressableScale
          accessibilityLabel={`Mark ${task.title} as ${
            task.completed ? 'incomplete' : 'complete'
          }`}
          accessibilityState={{checked: task.completed}}
          accessibilityRole="checkbox"
          onPress={toggle}
          style={[
            styles.checkbox,
            {
              backgroundColor: task.completed
                ? theme.colors.success
                : theme.colors.surface,
              borderColor: task.completed ? theme.colors.success : theme.colors.border,
            },
          ]}>
          {task.completed ? <Check color="#FFFFFF" size={15} strokeWidth={3} /> : null}
        </PressableScale>

        <View style={styles.content}>
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              {
                color: task.completed ? theme.colors.textMuted : theme.colors.text,
              },
              task.completed && styles.completedText,
            ]}>
            {task.title}
          </Text>
          {task.description ? (
            <Text
              numberOfLines={2}
              style={[
                styles.description,
                {
                  color: theme.colors.textMuted,
                },
                task.completed && styles.completedText,
              ]}>
              {task.description}
            </Text>
          ) : null}
          {task.dueDate ? (
            <View style={styles.meta}>
              <CalendarDays
                color={overdue ? theme.colors.danger : theme.colors.textMuted}
                size={13}
              />
              <Text
                style={[
                  styles.dueDate,
                  {color: overdue ? theme.colors.danger : theme.colors.textMuted},
                ]}>
                {overdue ? 'Overdue · ' : ''}
                {formatDueDate(task.dueDate)}
              </Text>
            </View>
          ) : null}
        </View>

        <PressableScale
          accessibilityLabel={`Delete ${task.title}`}
          onPress={onDelete}
          hitSlop={8}
          style={styles.deleteButton}>
          <Trash2 color={theme.colors.textMuted} size={17} />
        </PressableScale>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    marginTop: 1,
    width: 24,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  container: {
    alignItems: 'flex-start',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  deleteButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  description: {
    fontSize: fontSize.caption,
    lineHeight: 16,
  },
  dueDate: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '700',
    lineHeight: 19,
  },
});
