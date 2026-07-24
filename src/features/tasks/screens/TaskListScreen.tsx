import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  ArrowDownUp,
  CalendarClock,
  Mic,
  Moon,
  Plus,
  Search,
  Sun,
} from 'lucide-react-native';

import {Chip} from '../../../components/Chip';
import {IconButton} from '../../../components/IconButton';
import {LoadingView} from '../../../components/LoadingView';
import {PressableScale} from '../../../components/PressableScale';
import {VoiceInputSheet} from '../../../services/voice/VoiceInputSheet';
import {useVoiceRecognition} from '../../../services/voice/useVoiceRecognition';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../../theme/tokens';
import type {RootStackParamList} from '../../../types/navigation';
import {splitVoiceTasks} from '../../../utils/splitVoiceTasks';

import {EmptyTasks} from '../components/EmptyTasks';
import {TaskItem} from '../components/TaskItem';
import {TaskProgress} from '../components/TaskProgress';
import {useTasks} from '../context/TaskProvider';
import type {Task, TaskFilter, TaskSort} from '../types/task';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

const filters: {label: string; value: TaskFilter}[] = [
  {label: 'All', value: 'all'},
  {label: 'Active', value: 'active'},
  {label: 'Completed', value: 'completed'},
];

export function TaskListScreen({navigation}: Props) {
  const {theme, preference, toggleTheme} = useAppTheme();
  const {
    tasks,
    isLoading,
    storageError,
    addTasks,
    toggleTask,
    deleteTask,
  } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('created');
  const [query, setQuery] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [createdByVoice, setCreatedByVoice] = useState<string[]>([]);

  const handleVoiceResult = useCallback(
    (transcript: string) => {
      const titles = splitVoiceTasks(transcript);
      if (titles.length) {
        addTasks(titles);
        setCreatedByVoice(titles);
      }
    },
    [addTasks],
  );

  const voice = useVoiceRecognition(handleVoiceResult);

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = tasks.filter(task => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' ? task.completed : !task.completed);
      const matchesSearch =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description?.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((left, right) => {
      if (sort === 'dueDate') {
        if (!left.dueDate) {
          return 1;
        }
        if (!right.dueDate) {
          return -1;
        }
        return left.dueDate.localeCompare(right.dueDate);
      }
      return right.createdAt.localeCompare(left.createdAt);
    });
  }, [filter, query, sort, tasks]);

  const completedCount = tasks.filter(task => task.completed).length;

  const askToDelete = useCallback(
    (task: Task) => {
      Alert.alert(
        'Delete task?',
        `“${task.title}” will be permanently removed.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteTask(task.id),
          },
        ],
      );
    },
    [deleteTask],
  );

  const openVoice = () => {
    setCreatedByVoice([]);
    setVoiceOpen(true);
  };

  const closeVoice = () => {
    voice.cancel();
    setVoiceOpen(false);
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <View style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={visibleTasks}
        keyExtractor={task => task.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyTasks
            filtered={Boolean(query) || filter !== 'all'}
            onAdd={() => navigation.navigate('AddTask')}
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
                placeholder="Search tasks"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.searchInput, {color: theme.colors.text}]}
                value={query}
              />
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
              <IconButton
                icon={sort === 'dueDate' ? CalendarClock : ArrowDownUp}
                label={
                  sort === 'dueDate'
                    ? 'Sort by newest'
                    : 'Sort by due date'
                }
                onPress={() =>
                  setSort(current => (current === 'created' ? 'dueDate' : 'created'))
                }
                selected={sort === 'dueDate'}
              />
            </View>

            {visibleTasks.length ? (
              <Text style={[styles.sectionLabel, {color: theme.colors.textMuted}]}>
                {visibleTasks.length} {visibleTasks.length === 1 ? 'TASK' : 'TASKS'}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.item}>
            <TaskItem
              onDelete={() => askToDelete(item)}
              onToggle={() => toggleTask(item.id)}
              task={item}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.actions}>
        <PressableScale
          accessibilityLabel="Add task"
          onPress={() => navigation.navigate('AddTask')}
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

      <VoiceInputSheet
        createdTasks={createdByVoice}
        error={voice.error}
        onClose={closeVoice}
        onStart={voice.start}
        onStop={voice.stop}
        state={voice.state}
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
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
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
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: spacing.xs,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
