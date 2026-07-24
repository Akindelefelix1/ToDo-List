package com.akindelefelix.todolist

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class TaskReminderModule(
    private val context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

  override fun getName() = "TaskReminder"

  @ReactMethod
  fun schedule(taskId: String, title: String, timestamp: Double, promise: Promise) {
    try {
      val triggerAt = timestamp.toLong()
      if (triggerAt <= System.currentTimeMillis()) {
        promise.reject("E_PAST_REMINDER", "Reminder time must be in the future.")
        return
      }

      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val pendingIntent = reminderIntent(taskId, title)
      alarmManager.setAndAllowWhileIdle(
          AlarmManager.RTC_WAKEUP,
          triggerAt,
          pendingIntent
      )
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("E_REMINDER_SCHEDULE", error.message, error)
    }
  }

  @ReactMethod
  fun cancel(taskId: String, promise: Promise) {
    try {
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      alarmManager.cancel(reminderIntent(taskId, ""))
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("E_REMINDER_CANCEL", error.message, error)
    }
  }

  private fun reminderIntent(taskId: String, title: String): PendingIntent {
    val intent = Intent(context, TaskReminderReceiver::class.java).apply {
      putExtra(TaskReminderReceiver.EXTRA_TASK_ID, taskId)
      putExtra(TaskReminderReceiver.EXTRA_TASK_TITLE, title)
    }
    return PendingIntent.getBroadcast(
        context,
        taskId.hashCode(),
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }
}
