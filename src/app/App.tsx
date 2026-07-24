import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import {TaskProvider} from '@/features/tasks/context/TaskProvider';
import {ThemeProvider, useAppTheme} from '@/theme/ThemeProvider';
import {toNavigationTheme} from '@/theme/theme';

import {RootNavigator} from './navigation/RootNavigator';

function AppContent() {
  const {theme} = useAppTheme();

  return (
    <NavigationContainer theme={toNavigationTheme(theme)}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
        <RootNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
