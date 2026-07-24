import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {useAppTheme} from '../theme/ThemeProvider';
import {fontSize, spacing} from '../theme/tokens';

export function LoadingView() {
  const {theme} = useAppTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ActivityIndicator color={theme.colors.primary} size="small" />
      <Text style={[styles.label, {color: theme.colors.textMuted}]}>
        Loading your tasks…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.body,
  },
});
