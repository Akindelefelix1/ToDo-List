import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  ArrowDownUp,
  LayoutList,
  Mic,
  Moon,
  Plus,
  Search,
  Sun,
  Table2,
  X,
} from 'lucide-react-native';

import {Chip} from '../../../components/Chip';
import {IconButton} from '../../../components/IconButton';
import {LoadingView} from '../../../components/LoadingView';
import {PressableScale} from '../../../components/PressableScale';
import {SwipeActions} from '../../../components/SwipeActions';
import {
  UndoSnackbar,
  type SnackbarNotice,
} from '../../../components/UndoSnackbar';
import {
  cancelTaskReminder,
  syncTaskReminder,
} from '../../../services/reminders/taskReminders';
import {VoiceInputSheet} from '../../../services/voice/VoiceInputSheet';
import {useVoiceRecognition} from '../../../services/voice/useVoiceRecognition';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../../theme/tokens';
import type {RootStackParamList} from '../../../types/navigation';
import {triggerHaptic} from '../../../utils/haptics';
import {splitVoiceTasks} from '../../../utils/splitVoiceTasks';

import {EmptyTasks} from '../components/EmptyTasks';
import {SortSheet} from '../components/SortSheet';
import {TaskItem} from '../components/TaskItem';
import {TaskProgress} from '../components/TaskProgress';
import {TaskSectionHeader} from '../components/TaskSectionHeader';
import {TaskTableHeader, TaskTableRow} from '../components/TaskTable';
import {useTasks} from '../context/TaskProvider';
import type {
  Task,
  TaskFilter,
  TaskSort,
  TaskViewMode,
} from '../types/task';
import {
  matchesTaskSearch,
  organizeTaskSections,
} from '../utils/taskList';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

const filters: {label: string; value: TaskFilter}[] = [
  {label: 'All', value: 'all'},
  {label: 'Active', value: 'active'},
  {label: 'Completed', value: 'completed'},
];
const VIEW_MODE_KEY = '@todo-list/task-view-mode';
const SORT_KEY = '@todo-list/task-sort';
const validSorts: TaskSort[] = [
  'priority',
  'dueDate',
  'createdDesc',
  'createdAsc',
];
const sortLabels: Record<TaskSort, string> = {
  priority: 'PRIORITY',
  dueDate: 'DUE DATE',
  createdDesc: 'RECENT',
  createdAsc: 'OLDEST',
};

export function TaskListScreen({navigation}: Props) {
  const {theme, preference, toggleTheme} = useAppTheme();
  const {
    tasks,
    isLoading,
    storageError,
    addVoiceTasks,
    toggleTask,
    undoToggleTask,
    deleteTask,
    restoreTask,
  } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('createdDesc');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<TaskViewMode>('cards');
  const [sortOpen, setSortOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [suggestedVoiceTasks, setSuggestedVoiceTasks] = useState<string[]>([]);
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);

  const handleVoiceResult = useCallback((transcript: string) => {
    setSuggestedVoiceTasks(splitVoiceTasks(transcript));
    triggerHaptic('success');
  }, []);
  const voice = useVoiceRecognition(handleVoiceResult);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(VIEW_MODE_KEY),
      AsyncStorage.getItem(SORT_KEY),
    ])
      .then(([storedView, storedSort]) => {
        if (storedView === 'cards' || storedView === 'table') {
          setViewMode(storedView);
        }
        if (validSorts.includes(storedSort as TaskSort)) {
          setSort(storedSort as TaskSort);
        }
      })
      .catch(() => undefined);
  }, []);

  const filteredTasks = useMemo(
    () =>
      tasks.filter(task => {
        const matchesFilter =
          filter === 'all' ||
          (filter === 'completed' ? task.completed : !task.completed);
        return matchesFilter && matchesTaskSearch(task, query);
      }),
    [filter, query, tasks],
  );
  const sections = useMemo(
    () => organizeTaskSections(filteredTasks, sort),
    [filteredTasks, sort],
  );
  const completedCount = tasks.filter(task => task.completed).length;

  const dismissNotice = useCallback(() => setNotice(null), []);
  const showUndo = useCallback((message: string, onUndo: () => void) => {
    setNotice({id: Date.now(), message, onUndo});
  }, []);

  const handleToggle = useCallback(
    (task: Task) => {
      const result = toggleTask(task.id);
      if (!result) {
        return;
      }
      triggerHaptic('success');

      if (task.completed) {
        syncTaskReminder(task).catch(() => undefined);
      } else {
        cancelTaskReminder(task.id).catch(() => undefined);
        if (result.generatedTask) {
          syncTaskReminder(result.generatedTask).catch(() => undefined);
        }
      }

      showUndo(task.completed ? 'Task marked active' : 'Task completed', () => {
        undoToggleTask(result);
        if (result.generatedTask) {
          cancelTaskReminder(result.generatedTask.id).catch(() => undefined);
        }
        if (!task.completed) {
          syncTaskReminder(task).catch(() => undefined);
        }
      });
    },
    [showUndo, toggleTask, undoToggleTask],
  );

  const handleDelete = useCallback(
    (task: Task) => {
      const deleted = deleteTask(task.id);
      if (!deleted) {
        return;
      }
      cancelTaskReminder(task.id).catch(() => undefined);
      triggerHaptic();
      showUndo('Task deleted', () => {
        restoreTask(deleted);
        syncTaskReminder(deleted).catch(() => undefined);
      });
    },
    [deleteTask, restoreTask, showUndo],
  );

  const toggleViewMode = () => {
    triggerHaptic();
    setViewMode(current => {
      const next = current === 'cards' ? 'table' : 'cards';
      AsyncStorage.setItem(VIEW_MODE_KEY, next).catch(() => undefined);
      return next;
    });
  };

  const changeSort = (value: TaskSort) => {
    setSort(value);
    AsyncStorage.setItem(SORT_KEY, value).catch(() => undefined);
    triggerHaptic();
  };

  const openVoice = () => {
    setSuggestedVoiceTasks([]);
    setVoiceOpen(true);
    triggerHaptic();
  };

  const closeVoice = () => {
    voice.cancel();
    setVoiceOpen(false);
    setSuggestedVoiceTasks([]);
  };

  const confirmVoiceTasks = () => {
    const validTasks = suggestedVoiceTasks.map(title => title.trim()).filter(Boolean);
    if (!validTasks.length) {
      return;
    }
    addVoiceTasks(validTasks);
    triggerHaptic('success');
    setVoiceOpen(false);
    setSuggestedVoiceTasks([]);
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <View style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      <SectionList
        contentContainerStyle={styles.listContent}
        sections={sections}
        keyExtractor={task => task.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyTasks
            filtered={Boolean(query) || filter !== 'all'}
            onAdd={() => navigation.navigate('TaskForm')}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.topBar}>
              <View>
                <Text style={[styles.eyebrow, {color: theme.colors.primary}]}>
                  MY DAY
                </Text>
                <Text style={[styles.heading, {color: theme.colors.text}]}>
                  Make it happen.
                </Text>
              </View>
              <IconButton
                icon={preference === 'dark' ? Sun : Moon}
                label={`Use ${preference === 'dark' ? 'light' : 'dark'} theme`}
                onPress={toggleTheme}
              />
            </View>

            {storageError ? (
              <View
                style={[
                  styles.notice,
                  {backgroundColor: `${theme.colors.danger}14`},
                ]}>
                <Text style={[styles.noticeText, {color: theme.colors.danger}]}>
                  {storageError}
                </Text>
              </View>
            ) : null}

            <TaskProgress completed={completedCount} total={tasks.length} />

            <View
              style={[
                styles.search,
                {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
              ]}>
              <Search color={theme.colors.textMuted} size={17} />
              <TextInput
                accessibilityLabel="Search tasks"
                onChangeText={setQuery}
                placeholder="Search title, tag, category, priority…"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.searchInput, {color: theme.colors.text}]}
                value={query}
              />
              {query ? (
                <PressableScale
                  accessibilityLabel="Clear search"
                  hitSlop={10}
                  onPress={() => setQuery('')}
                  style={[
                    styles.clearSearch,
                    {backgroundColor: theme.colors.background},
                  ]}>
                  <X color={theme.colors.textMuted} size={14} strokeWidth={2.5} />
                </PressableScale>
              ) : null}
            </View>

            <View style={styles.controls}>
              <View style={styles.filters}>
                {filters.map(item => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    onPress={() => setFilter(item.value)}
                    selected={filter === item.value}
                  />
                ))}
              </View>
              <View style={styles.controlActions}>
                <IconButton
                  icon={ArrowDownUp}
                  label="Choose task sorting"
                  onPress={() => setSortOpen(true)}
                  selected={sort !== 'createdDesc'}
                />
                <IconButton
                  icon={viewMode === 'cards' ? Table2 : LayoutList}
                  label={`Switch to ${
                    viewMode === 'cards' ? 'table' : 'card'
                  } view`}
                  onPress={toggleViewMode}
                  selected={viewMode === 'table'}
                />
              </View>
            </View>

            {filteredTasks.length ? (
              <Text style={[styles.totalLabel, {color: theme.colors.textMuted}]}>
                {filteredTasks.length}{' '}
                {filteredTasks.length === 1 ? 'TASK' : 'TASKS'} ·{' '}
                {sortLabels[sort]}
              </Text>
            ) : null}
          </View>
        }
        renderSectionHeader={({section}) => (
          <>
            <TaskSectionHeader
              count={section.data.length}
              sectionKey={section.key}
              title={section.title}
            />
            {viewMode === 'table' ? (
              <View style={styles.tableHeader}>
                <TaskTableHeader />
              </View>
            ) : null}
          </>
        )}
        renderItem={({item}) => {
          const edit = () => navigation.navigate('TaskForm', {taskId: item.id});
          const remove = () => handleDelete(item);
          const toggle = () => handleToggle(item);
          return (
            <View style={viewMode === 'cards' ? styles.item : styles.tableItem}>
              <SwipeActions
                onComplete={toggle}
                onDelete={remove}
                onEdit={edit}>
                {viewMode === 'cards' ? (
                  <TaskItem
                    onDelete={remove}
                    onEdit={edit}
                    onToggle={toggle}
                    task={item}
                  />
                ) : (
                  <TaskTableRow
                    onDelete={remove}
                    onEdit={edit}
                    onToggle={toggle}
                    task={item}
                  />
                )}
              </SwipeActions>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.actions}>
        <PressableScale
          accessibilityLabel="Add task"
          onPress={() => navigation.navigate('TaskForm')}
          style={[
            styles.addButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Plus color={theme.colors.primary} size={18} strokeWidth={3} />
          <Text style={[styles.addLabel, {color: theme.colors.text}]}>New task</Text>
        </PressableScale>
        <PressableScale
          accessibilityLabel="Add tasks by voice"
          onPress={openVoice}
          style={[styles.fab, {backgroundColor: theme.colors.primary}]}>
          <Mic color="#FFFFFF" size={23} />
        </PressableScale>
      </View>

      <UndoSnackbar notice={notice} onDismiss={dismissNotice} />
      <SortSheet
        onChange={changeSort}
        onClose={() => setSortOpen(false)}
        value={sort}
        visible={sortOpen}
      />
      <VoiceInputSheet
        error={voice.error}
        onChangeTask={(index, value) =>
          setSuggestedVoiceTasks(current =>
            current.map((title, itemIndex) => (itemIndex === index ? value : title)),
          )
        }
        onClose={closeVoice}
        onConfirm={confirmVoiceTasks}
        onRemoveTask={index =>
          setSuggestedVoiceTasks(current =>
            current.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        onStart={voice.start}
        onStop={voice.stop}
        state={voice.state}
        suggestedTasks={suggestedVoiceTasks}
        transcript={voice.transcript}
        visible={voiceOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    bottom: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
    position: 'absolute',
    right: spacing.xl,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  addLabel: {
    fontSize: fontSize.body,
    fontWeight: '800',
  },
  clearSearch: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  controlActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  fab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#242568',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.24,
    shadowRadius: 12,
    width: 56,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerContent: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: spacing.xs,
  },
  item: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 108,
  },
  notice: {
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  noticeText: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
  screen: {
    flex: 1,
  },
  search: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.body,
    paddingVertical: 0,
  },
  tableHeader: {
    paddingHorizontal: spacing.xl,
  },
  tableItem: {
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
});
