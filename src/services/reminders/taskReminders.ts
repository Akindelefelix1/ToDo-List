import {NativeModules, PermissionsAndroid, Platform} from 'react-native';

import type {Task} from '../../features/tasks/types/task';

type TaskReminderModule = {
  schedule: (taskId: string, title: string, timestamp: number) => Promise<void>;
  cancel: (taskId: string) => Promise<void>;
};

const nativeReminder = NativeModules.TaskReminder as TaskReminderModule | undefined;

async function requestNotificationPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: 'Task reminders',
      message: 'Allow Todo List to notify you when a scheduled task is due.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    },
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function syncTaskReminder(
  task: Pick<Task, 'id' | 'title' | 'reminderAt'>,
) {
  if (Platform.OS !== 'android' || !nativeReminder) {
    return;
  }

  await nativeReminder.cancel(task.id).catch(() => undefined);
  if (!task.reminderAt || new Date(task.reminderAt).getTime() <= Date.now()) {
    return;
  }

  if (await requestNotificationPermission()) {
    await nativeReminder.schedule(
      task.id,
      task.title,
      new Date(task.reminderAt).getTime(),
    );
  }
}

export async function cancelTaskReminder(taskId: string) {
  if (Platform.OS === 'android' && nativeReminder) {
    await nativeReminder.cancel(taskId).catch(() => undefined);
  }
}
