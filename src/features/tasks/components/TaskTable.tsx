import React from 'react';
import {LayoutAnimation, StyleSheet, Text, View} from 'react-native';
import {
  Check,
  Keyboard,
  Mic,
  Pencil,
  Trash2,
} from 'lucide-react-native';

import {PressableScale} from '../../../components/PressableScale';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../../theme/tokens';
import {formatDueDate, isOverdue} from '../../../utils/date';
import type {Task} from '../types/task';
import {PriorityBadge} from './PriorityBadge';

type RowProps = {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hideInlineActions?: boolean;
};

export function TaskTableHeader() {
  const {theme} = useAppTheme();
  return (
    <View
      style={[
        styles.header,
        {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
      ]}>
      <View style={styles.statusColumn} />
      <Text style={[styles.headerLabel, styles.taskColumn, {color: theme.colors.textMuted}]}>
        TASK
      </Text>
      <Text
        style={[styles.headerLabel, styles.priorityColumn, {color: theme.colors.textMuted}]}>
        PRIORITY
      </Text>
      <Text style={[styles.headerLabel, styles.dueColumn, {color: theme.colors.textMuted}]}>
        DUE
      </Text>
      <View style={styles.actionsColumn} />
    </View>
  );
}

export function TaskTableRow({
  task,
  onToggle,
  onEdit,
  onDelete,
  hideInlineActions = false,
}: RowProps) {
  const {theme} = useAppTheme();
  const overdue = !task.completed && isOverdue(task.dueDate);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View
      style={[
        styles.row,
        {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
      ]}>
      <View style={styles.statusColumn}>
        <PressableScale
          accessibilityLabel={`Mark ${task.title} as ${
            task.completed ? 'incomplete' : 'complete'
          }`}
          accessibilityRole="checkbox"
          accessibilityState={{checked: task.completed}}
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
          {task.completed ? <Check color="#FFFFFF" size={12} strokeWidth={3} /> : null}
        </PressableScale>
      </View>

      <View style={styles.taskColumn}>
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            {color: task.completed ? theme.colors.textMuted : theme.colors.text},
            task.completed && styles.completed,
          ]}>
          {task.title}
        </Text>
        <View style={styles.source}>
          {task.source === 'voice' ? (
            <Mic color={theme.colors.textMuted} size={9} />
          ) : (
            <Keyboard color={theme.colors.textMuted} size={9} />
          )}
          <Text style={[styles.sourceText, {color: theme.colors.textMuted}]}>
            {task.source === 'voice' ? 'Voice' : 'Typed'}
          </Text>
        </View>
      </View>

      <View style={styles.priorityColumn}>
        <PriorityBadge compact priority={task.priority} />
      </View>

      <Text
        numberOfLines={2}
        style={[
          styles.dueText,
          styles.dueColumn,
          {color: overdue ? theme.colors.danger : theme.colors.textMuted},
        ]}>
        {task.dueDate ? formatDueDate(task.dueDate) : '—'}
      </Text>

      <View style={[styles.actionsColumn, styles.actions]}>
        {!hideInlineActions ? (
          <>
            <PressableScale
              accessibilityLabel={`Edit ${task.title}`}
              hitSlop={6}
              onPress={onEdit}
              style={styles.iconButton}>
              <Pencil color={theme.colors.primary} size={14} />
            </PressableScale>
            <PressableScale
              accessibilityLabel={`Delete ${task.title}`}
              hitSlop={6}
              onPress={onDelete}
              style={styles.iconButton}>
              <Trash2 color={theme.colors.textMuted} size={14} />
            </PressableScale>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
  },
  actionsColumn: {
    width: 54,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  completed: {
    textDecorationLine: 'line-through',
  },
  dueColumn: {
    width: 56,
  },
  dueText: {
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 13,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    flexDirection: 'row',
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  headerLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  iconButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 27,
  },
  priorityColumn: {
    alignItems: 'center',
    width: 54,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  source: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    marginTop: spacing.xs,
  },
  sourceText: {
    fontSize: 8,
    fontWeight: '600',
  },
  statusColumn: {
    alignItems: 'center',
    width: 30,
  },
  taskColumn: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  title: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    lineHeight: 15,
  },
});
