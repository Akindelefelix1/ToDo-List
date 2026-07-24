# Todo List

A polished, offline-first to-do application built with React Native Community CLI and TypeScript. It supports task management, local persistence, due dates, search and filters, light/dark themes, and Android voice input.

## Features

- Add tasks with a required title, optional description, and optional due date
- Edit created tasks without losing their completion state
- Mark tasks complete or incomplete
- Delete tasks with confirmation
- Persist tasks and theme preference with AsyncStorage
- Search tasks and filter by all, active, or completed
- Sort by newest or due date
- Toggle light and dark themes
- Dictate one or multiple tasks from the animated microphone FAB
- Split natural speech such as “Buy provisions and call mom” into separate tasks
- Friendly empty, validation, permission, storage, and speech-error states
- Small, readable typography and accessible touch targets

## Technology

- React Native `0.86`
- React `19`
- TypeScript with strict mode
- React Navigation native stack
- AsyncStorage
- Android `SpeechRecognizer` through a lifecycle-safe native Kotlin module
- React Native `Animated` and `LayoutAnimation`
- Jest

No Expo packages are used. Voice recognition uses the Android system speech-recognition service, so the app contains no embedded cloud API key. Depending on the device’s recognition service, speech may be processed on-device or remotely.

## Project structure

```text
src/
├── app/
│   ├── navigation/          # Root navigator and route configuration
│   └── App.tsx              # Application composition
├── components/              # Reusable, app-wide UI primitives
├── features/
│   └── tasks/
│       ├── components/      # Task-specific reusable UI
│       ├── context/         # Task state and actions
│       ├── screens/         # Task List and reusable Task Form screens
│       ├── services/        # Task persistence
│       └── types/           # Task domain models
├── services/
│   └── voice/               # Voice bridge, hook, and presentation
├── theme/                   # Design tokens, themes, and provider
├── types/                   # Shared application types
└── utils/                   # Pure tested helpers
```

Native Android voice code lives under:

```text
android/app/src/main/java/com/akindelefelix/todolist/
```

## Prerequisites

- Node.js `22.11` or newer
- JDK 17
- Android Studio and Android SDK
- An Android emulator with Google speech services, or a physical Android device

Follow the official React Native [Android environment setup](https://reactnative.dev/docs/set-up-your-environment) before running the project.

## Install and run

This repository uses npm.

```powershell
npm.cmd install
npm.cmd start
```

In a second terminal:

```powershell
npm.cmd run android
```

On shells without the Windows PowerShell script restriction, `npm` can be used instead of `npm.cmd`.

## Quality checks

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test -- --runInBand
```

Build a debug APK:

```powershell
cd android
.\gradlew.bat assembleDebug
```

The APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Voice input

1. Tap the purple microphone FAB on the Task List screen.
2. Allow microphone access the first time.
3. Tap **Start listening** and dictate one or more actions.
4. Tap **Finish speaking**, or pause naturally.
5. Review the tasks that were added.

The app requests microphone permission only when voice input is used. Android 11+ speech-service discovery is declared in the manifest, and the native recognizer is destroyed after results, errors, cancellation, or React teardown.

## Screenshots

Real emulator/device screenshots belong in [`screenshots/`](./screenshots). Capture the required states using the filenames documented in [`screenshots/README.md`](./screenshots/README.md), then replace this section with:

```md
| Empty state | Task list |
| --- | --- |
| ![Empty state](screenshots/01-empty-state.png) | ![Task list](screenshots/02-task-list.png) |

| Add task | Voice listening |
| --- | --- |
| ![Add task](screenshots/03-add-task.png) | ![Voice listening](screenshots/04-voice-listening.png) |

| Voice results | Dark theme |
| --- | --- |
| ![Voice results](screenshots/05-voice-results.png) | ![Dark theme](screenshots/06-dark-theme.png) |
```

Screenshots must be captured from the actual build; mockups are intentionally not included.
