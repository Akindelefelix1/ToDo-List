# Todo List

A polished, offline-first to-do application built with React Native Community CLI and strict TypeScript. It supports task management, local persistence, reminders, recurrence, voice input, organization, search, and accessible light/dark interfaces.

## Features

- Add and edit tasks with a title, optional description, priority, due date, and reminder
- Mark tasks complete or incomplete
- Delete or complete tasks with a temporary Undo snackbar
- Keep active work organized into Overdue, Today, Upcoming, and No due date sections
- Keep completed tasks in a separate section below active work
- Repeat tasks daily, weekly, or monthly
- Organize work with categories and comma-separated tags
- Persist tasks, theme, sorting, and view preference with AsyncStorage
- Sort by priority, due date, recently created, or oldest first
- Search titles, descriptions, categories, tags, priority, source, status, and date labels
- Filter by all, active, or completed
- Switch between detailed card and compact table views
- Swipe right to complete; swipe left to reveal edit and delete actions
- Expand cards to inspect reminder, recurrence, category, and tag details
- Toggle persistent light and dark themes
- Dictate multiple tasks through the animated microphone FAB
- Review, edit, remove, and explicitly confirm voice-generated tasks before saving
- Split speech such as “Buy provisions and call mom” into separate tasks
- Receive subtle haptic feedback for important actions
- Handle empty, validation, permission, storage, notification, and speech states

## Technology

- React Native `0.86` without Expo
- React `19`
- Strict TypeScript
- React Navigation native stack
- AsyncStorage
- Native Android `SpeechRecognizer`
- Native Android `AlarmManager` and notification channels
- React Native `Animated`, `LayoutAnimation`, and `PanResponder`
- Jest

Voice recognition uses the Android system speech service, so no cloud API key is embedded in the app. Depending on the device’s recognition provider, speech may be processed on-device or remotely.

## Project structure

```text
src/
|-- app/
|   |-- navigation/          # Typed route configuration
|   `-- App.tsx              # Application composition
|-- components/              # Reusable global UI primitives
|-- features/
|   `-- tasks/
|       |-- components/      # Task-specific reusable UI
|       |-- context/         # Task state and actions
|       |-- screens/         # Task List and reusable Task Form
|       |-- services/        # Task persistence
|       |-- types/           # Task domain models
|       `-- utils/           # Search, sorting, and sectioning
|-- services/
|   |-- reminders/           # Android reminder bridge
|   `-- voice/               # Voice bridge, hook, and review UI
|-- theme/                   # Tokens, themes, and provider
|-- types/                   # Shared navigation types
`-- utils/                   # Tested date, speech, and haptic helpers
```

Native Android voice and reminder code lives in:

```text
android/app/src/main/java/com/akindelefelix/todolist/
```




## Quality checks

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test -- --runInBand
```

## Voice input

1. Tap the purple microphone FAB.
2. Allow microphone access on first use.
3. Tap **Start listening** and dictate one or more actions.
4. Tap **Finish speaking**, or pause naturally.
5. Review the detected tasks.
6. Edit or remove incorrect results, then confirm.

Android 11+ speech-service discovery is declared in the manifest. The recognizer is destroyed after results, errors, cancellation, or React teardown.

## Reminders and recurrence

Choose a future reminder date and time in the task form. Android 13+ requests notification permission only when a reminder is scheduled. Editing, completing, or deleting a task updates or cancels its pending reminder.

Completing a daily, weekly, or monthly task creates its next occurrence. Undoing the completion also removes that generated occurrence.

## Screenshots

Real device screenshots are in [`screenshots/`](./screenshots).

