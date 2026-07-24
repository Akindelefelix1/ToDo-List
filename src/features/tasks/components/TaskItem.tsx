import React, {useEffect, useRef, useState} from 'react';
import {Animated, LayoutAnimation, StyleSheet, Text, View} from 'react-native';
import {
  CalendarDays,
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Keyboard,
  Mic,
  Pencil,
  Repeat2,
  Tags,
  Trash2,
} from 'lucide-react-native';

import {PressableScale} from '../../../components/PressableScale';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../../theme/tokens';
import {
  formatCreatedAt,
  formatDateTime,
  formatDueDate,
  isOverdue,
} from '../../../utils/date';

import type {Task} from '../types/task';
import {PriorityBadge} from './PriorityBadge';

type Props = {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hideInlineActions?: boolean;
};

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  hideInlineActions = false,
}: Props) {
  const {theme} = useAppTheme();
  const [expanded, setExpanded] = useState(false);
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
          <View style={styles.titleRow}>
            <Text
              numberOfLines={2}
              style={[
                styles.title,
                {
                  color: task.completed
                    ? theme.colors.textMuted
                    : theme.colors.text,
                },
                task.completed && styles.completedText,
              ]}>
              {task.title}
            </Text>
            <View
              style={[
                styles.sourceBadge,
                {backgroundColor: theme.colors.primarySoft},
              ]}>
              {task.source === 'voice' ? (
                <Mic color={theme.colors.primary} size={10} />
              ) : (
                <Keyboard color={theme.colors.primary} size={10} />
              )}
              <Text style={[styles.sourceLabel, {color: theme.colors.primary}]}>
                {task.source === 'voice' ? 'Voice' : 'Typed'}
              </Text>
            </View>
          </View>
          {task.description ? (
            <Text
              numberOfLines={expanded ? undefined : 2}
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
          <PriorityBadge priority={task.priority} />
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
          <View style={styles.meta}>
            <Clock3 color={theme.colors.textMuted} size={12} />
            <Text style={[styles.createdAt, {color: theme.colors.textMuted}]}>
              {formatCreatedAt(task.createdAt)}
            </Text>
          </View>
          {expanded ? (
            <View style={styles.details}>
              {task.reminderAt ? (
                <View style={styles.meta}>
                  <Bell color={theme.colors.primary} size={12} />
                  <Text style={[styles.detailText, {color: theme.colors.textMuted}]}>
                    Reminder {formatDateTime(task.reminderAt)}
                  </Text>
                </View>
              ) : null}
              {task.recurrence !== 'none' ? (
                <View style={styles.meta}>
                  <Repeat2 color={theme.colors.primary} size={12} />
                  <Text style={[styles.detailText, {color: theme.colors.textMuted}]}>
                    Repeats {task.recurrence}
                  </Text>
                </View>
              ) : null}
              {task.category || task.tags.length ? (
                <View style={styles.meta}>
                  <Tags color={theme.colors.primary} size={12} />
                  <Text style={[styles.detailText, {color: theme.colors.textMuted}]}>
                    {[task.category, ...task.tags].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <PressableScale
            accessibilityLabel={expanded ? 'Collapse task details' : 'Expand task details'}
            accessibilityState={{expanded}}
            onPress={() => setExpanded(value => !value)}
            hitSlop={8}
            style={styles.actionButton}>
            {expanded ? (
              <ChevronUp color={theme.colors.textMuted} size={17} />
            ) : (
              <ChevronDown color={theme.colors.textMuted} size={17} />
            )}
          </PressableScale>
          <View
            pointerEvents={hideInlineActions ? 'none' : 'auto'}
            style={[
              styles.inlineActions,
              hideInlineActions && styles.hiddenInlineActions,
            ]}>
            <PressableScale
              accessibilityLabel={`Edit ${task.title}`}
              onPress={onEdit}
              hitSlop={8}
              style={styles.actionButton}>
              <Pencil color={theme.colors.primary} size={16} />
            </PressableScale>
            <PressableScale
              accessibilityLabel={`Delete ${task.title}`}
              onPress={onDelete}
              hitSlop={8}
              style={styles.actionButton}>
              <Trash2 color={theme.colors.textMuted} size={17} />
            </PressableScale>
          </View>
        </View>
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
  createdAt: {
    fontSize: 10,
    fontWeight: '500',
  },
  actionButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  description: {
    fontSize: fontSize.caption,
    lineHeight: 16,
  },
  details: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  detailText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
  },
  hiddenInlineActions: {
    opacity: 0,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  sourceBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  sourceLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    flex: 1,
    fontSize: fontSize.bodyLarge,
    fontWeight: '700',
    lineHeight: 19,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
