import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Flag,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import {PressableScale} from '../../../components/PressableScale';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../../theme/tokens';
import type {TaskSort} from '../types/task';

type Props = {
  visible: boolean;
  value: TaskSort;
  onChange: (value: TaskSort) => void;
  onClose: () => void;
};

const options: {value: TaskSort; label: string; icon: LucideIcon}[] = [
  {value: 'priority', label: 'Priority', icon: Flag},
  {value: 'dueDate', label: 'Due date', icon: CalendarClock},
  {value: 'createdDesc', label: 'Recently created', icon: ArrowDown},
  {value: 'createdAsc', label: 'Oldest first', icon: ArrowUp},
];

export function SortSheet({visible, value, onChange, onClose}: Props) {
  const {theme} = useAppTheme();
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, {backgroundColor: theme.colors.surfaceElevated}]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, {color: theme.colors.text}]}>Sort tasks</Text>
              <Text style={[styles.subtitle, {color: theme.colors.textMuted}]}>
                Applied within each section
              </Text>
            </View>
            <PressableScale
              accessibilityLabel="Close sorting options"
              onPress={onClose}
              style={[styles.close, {backgroundColor: theme.colors.background}]}>
              <X color={theme.colors.textMuted} size={16} />
            </PressableScale>
          </View>
          <View style={styles.options}>
            {options.map(option => {
              const Icon = option.icon;
              const selected = option.value === value;
              return (
                <PressableScale
                  accessibilityState={{selected}}
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    onClose();
                  }}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected
                        ? theme.colors.primarySoft
                        : theme.colors.background,
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}>
                  <Icon
                    color={selected ? theme.colors.primary : theme.colors.textMuted}
                    size={17}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      {color: selected ? theme.colors.primary : theme.colors.text},
                    ]}>
                    {option.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  close: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  optionLabel: {
    fontSize: fontSize.body,
    fontWeight: '700',
  },
  options: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  overlay: {
    backgroundColor: 'rgba(8,12,22,0.54)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    fontSize: fontSize.caption,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
  },
});
