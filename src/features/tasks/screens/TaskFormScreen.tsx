import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Repeat2,
  Tags,
  X,
} from 'lucide-react-native';

import {IconButton} from '../../../components/IconButton';
import {PressableScale} from '../../../components/PressableScale';
import {syncTaskReminder} from '../../../services/reminders/taskReminders';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../../theme/tokens';
import type {RootStackParamList} from '../../../types/navigation';
import {addDays, formatDueDate, startOfDay} from '../../../utils/date';
import {triggerHaptic} from '../../../utils/haptics';

import {useTasks} from '../context/TaskProvider';
import type {TaskPriority, TaskRecurrence} from '../types/task';
import {PriorityBadge} from '../components/PriorityBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

export function TaskFormScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const {tasks, addTask, updateTask} = useTasks();
  const taskId = route.params?.taskId;
  const existingTask = taskId ? tasks.find(task => task.id === taskId) : undefined;
  const isEditing = Boolean(existingTask);
  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(
    existingTask?.description ?? '',
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : null,
  );
  const [priority, setPriority] = useState<TaskPriority>(
    existingTask?.priority ?? 'medium',
  );
  const [reminderAt, setReminderAt] = useState<Date | null>(
    existingTask?.reminderAt ? new Date(existingTask.reminderAt) : null,
  );
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(
    existingTask?.recurrence ?? 'none',
  );
  const [category, setCategory] = useState(existingTask?.category ?? '');
  const [tags, setTags] = useState(existingTask?.tags.join(', ') ?? '');
  const [titleError, setTitleError] = useState('');

  const canSave = title.trim().length > 0;
  const dateOptions = useMemo(
    () => [
      {label: 'Today', date: startOfDay()},
      {label: 'Tomorrow', date: addDays(new Date(), 1)},
      {label: 'Next week', date: addDays(new Date(), 7)},
      {label: 'Already due', date: addDays(new Date(), -1)},
    ],
    [],
  );

  const save = () => {
    if (!canSave) {
      setTitleError('Please enter a task title.');
      return;
    }
    const changes = {
      title,
      description,
      dueDate: dueDate?.toISOString(),
      priority,
      reminderAt: reminderAt?.toISOString(),
      recurrence,
      category,
      tags: [...new Set(tags.split(',').map(tag => tag.trim()).filter(Boolean))],
    };
    let savedTaskId: string;
    if (existingTask) {
      updateTask(existingTask.id, changes);
      savedTaskId = existingTask.id;
    } else {
      savedTaskId = addTask(changes).id;
    }
    syncTaskReminder({
      id: savedTaskId,
      title: title.trim(),
      reminderAt: changes.reminderAt,
    }).catch(() => undefined);
    triggerHaptic('success');
    navigation.goBack();
  };

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: dueDate ?? new Date(),
      minimumDate: startOfDay(),
      mode: 'date',
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          setDueDate(startOfDay(selectedDate));
        }
      },
    });
  };

  const openReminderPicker = () => {
    const initial = reminderAt ?? new Date(Date.now() + 60 * 60 * 1000);
    DateTimePickerAndroid.open({
      value: initial,
      minimumDate: new Date(),
      mode: 'date',
      onChange: (dateEvent, selectedDate) => {
        if (dateEvent.type !== 'set' || !selectedDate) {
          return;
        }
        DateTimePickerAndroid.open({
          value: initial,
          mode: 'time',
          onChange: (timeEvent, selectedTime) => {
            if (timeEvent.type === 'set' && selectedTime) {
              const combined = new Date(selectedDate);
              combined.setHours(
                selectedTime.getHours(),
                selectedTime.getMinutes(),
                0,
                0,
              );
              setReminderAt(combined);
            }
          },
        });
      },
    });
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} label="Go back" onPress={navigation.goBack} />
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          {isEditing ? 'Edit task' : 'New task'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View>
          <Text style={[styles.eyebrow, {color: theme.colors.primary}]}>
            {isEditing ? 'REFINE THE DETAILS' : 'CAPTURE THE NEXT STEP'}
          </Text>
          <Text style={[styles.heading, {color: theme.colors.text}]}>
            {isEditing ? 'Update your task.' : 'What needs doing?'}
          </Text>
          <Text style={[styles.subheading, {color: theme.colors.textMuted}]}>
            {isEditing
              ? 'Keep the details accurate and useful.'
              : 'Keep it clear and actionable.'}
          </Text>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, {color: theme.colors.text}]}>Title</Text>
            <Text style={[styles.counter, {color: theme.colors.textMuted}]}>
              {title.length}/80
            </Text>
          </View>
          <TextInput
            accessibilityLabel="Task title"
            autoFocus
            maxLength={80}
            onChangeText={value => {
              setTitle(value);
              if (value.trim()) {
                setTitleError('');
              }
            }}
            onSubmitEditing={save}
            placeholder="e.g. Send project update"
            placeholderTextColor={theme.colors.textMuted}
            returnKeyType="done"
            style={[inputStyle, titleError ? {borderColor: theme.colors.danger} : null]}
            value={title}
          />
          {titleError ? (
            <Text style={[styles.error, {color: theme.colors.danger}]}>
              {titleError}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              Description <Text style={{color: theme.colors.textMuted}}>(optional)</Text>
            </Text>
            <Text style={[styles.counter, {color: theme.colors.textMuted}]}>
              {description.length}/240
            </Text>
          </View>
          <TextInput
            accessibilityLabel="Task description"
            maxLength={240}
            multiline
            onChangeText={setDescription}
            placeholder="Add a little more context…"
            placeholderTextColor={theme.colors.textMuted}
            style={[inputStyle, styles.description]}
            textAlignVertical="top"
            value={description}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Priority</Text>
          <View style={styles.priorityOptions}>
            {(['low', 'medium', 'high'] as const).map(option => {
              const selected = priority === option;
              return (
                <PressableScale
                  accessibilityLabel={`${option} priority`}
                  accessibilityState={{selected}}
                  key={option}
                  onPress={() => setPriority(option)}
                  style={[
                    styles.priorityOption,
                    {
                      backgroundColor: selected
                        ? theme.colors.primarySoft
                        : theme.colors.surface,
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}>
                  <PriorityBadge priority={option} />
                  {selected ? (
                    <Check color={theme.colors.primary} size={15} strokeWidth={3} />
                  ) : null}
                </PressableScale>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Due date</Text>
          <View style={styles.dateChips}>
            {dateOptions.map(option => {
              const selected =
                dueDate?.toDateString() === option.date.toDateString();
              return (
                <PressableScale
                  key={option.label}
                  onPress={() => setDueDate(option.date)}
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: selected
                        ? theme.colors.primarySoft
                        : theme.colors.surface,
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.dateChipText,
                      {
                        color: selected
                          ? theme.colors.primary
                          : theme.colors.textMuted,
                      },
                    ]}>
                    {option.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
          <PressableScale
            onPress={openDatePicker}
            style={[
              styles.customDate,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <CalendarDays color={theme.colors.primary} size={17} />
            <Text style={[styles.customDateText, {color: theme.colors.text}]}>
              {dueDate ? formatDueDate(dueDate.toISOString()) : 'Choose another date'}
            </Text>
            {dueDate ? (
              <PressableScale
                accessibilityLabel="Clear due date"
                hitSlop={8}
                onPress={() => setDueDate(null)}
                style={styles.clearDate}>
                <X color={theme.colors.textMuted} size={16} />
              </PressableScale>
            ) : null}
          </PressableScale>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Reminder</Text>
          <PressableScale
            onPress={openReminderPicker}
            style={[
              styles.customDate,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <Bell color={theme.colors.primary} size={17} />
            <Text style={[styles.customDateText, {color: theme.colors.text}]}>
              {reminderAt
                ? reminderAt.toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Choose reminder date and time'}
            </Text>
            {reminderAt ? (
              <PressableScale
                accessibilityLabel="Clear reminder"
                hitSlop={8}
                onPress={() => setReminderAt(null)}
                style={styles.clearDate}>
                <X color={theme.colors.textMuted} size={16} />
              </PressableScale>
            ) : null}
          </PressableScale>
        </View>

        <View style={styles.field}>
          <View style={styles.labelWithIcon}>
            <Repeat2 color={theme.colors.primary} size={15} />
            <Text style={[styles.label, {color: theme.colors.text}]}>Repeat</Text>
          </View>
          <View style={styles.dateChips}>
            {(['none', 'daily', 'weekly', 'monthly'] as const).map(option => {
              const selected = recurrence === option;
              return (
                <PressableScale
                  accessibilityLabel={`${option} recurrence`}
                  accessibilityState={{selected}}
                  key={option}
                  onPress={() => setRecurrence(option)}
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: selected
                        ? theme.colors.primarySoft
                        : theme.colors.surface,
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.dateChipText,
                      {
                        color: selected
                          ? theme.colors.primary
                          : theme.colors.textMuted,
                      },
                      styles.capitalize,
                    ]}>
                    {option}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <View style={styles.labelWithIcon}>
            <Tags color={theme.colors.primary} size={15} />
            <Text style={[styles.label, {color: theme.colors.text}]}>
              Organization
            </Text>
          </View>
          <TextInput
            accessibilityLabel="Task category"
            maxLength={30}
            onChangeText={setCategory}
            placeholder="Category, e.g. Work"
            placeholderTextColor={theme.colors.textMuted}
            style={inputStyle}
            value={category}
          />
          <TextInput
            accessibilityLabel="Task tags"
            autoCapitalize="none"
            maxLength={100}
            onChangeText={setTags}
            placeholder="Tags separated by commas"
            placeholderTextColor={theme.colors.textMuted}
            style={inputStyle}
            value={tags}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {backgroundColor: theme.colors.background, borderColor: theme.colors.border},
        ]}>
        <PressableScale
          disabled={!canSave}
          onPress={save}
          style={[styles.saveButton, {backgroundColor: theme.colors.primary}]}>
          <Check color="#FFFFFF" size={18} strokeWidth={3} />
          <Text style={styles.saveLabel}>
            {isEditing ? 'Save changes' : 'Create task'}
          </Text>
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  capitalize: {
    textTransform: 'capitalize',
  },
  clearDate: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    marginLeft: 'auto',
    width: 28,
  },
  content: {
    gap: spacing.xl,
    padding: spacing.xl,
    paddingBottom: 120,
  },
  counter: {
    fontSize: fontSize.caption,
  },
  customDate: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  customDateText: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  dateChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dateChipText: {
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
  dateChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  description: {
    minHeight: 108,
    paddingTop: spacing.md,
  },
  error: {
    fontSize: fontSize.caption,
    marginTop: spacing.sm,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  field: {
    gap: spacing.sm,
  },
  footer: {
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '800',
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSize.bodyLarge,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '800',
  },
  labelWithIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  saveLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.bodyLarge,
    fontWeight: '800',
  },
  screen: {
    flex: 1,
  },
  subheading: {
    fontSize: fontSize.body,
    marginTop: spacing.sm,
  },
});
