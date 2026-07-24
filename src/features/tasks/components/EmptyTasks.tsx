import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ClipboardCheck} from 'lucide-react-native';

import {PressableScale} from '../../../components/PressableScale';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {fontSize, radius, spacing} from '../../../theme/tokens';

type Props = {
  filtered: boolean;
  onAdd: () => void;
};

export function EmptyTasks({filtered, onAdd}: Props) {
  const {theme} = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.icon, {backgroundColor: theme.colors.primarySoft}]}>
        <ClipboardCheck color={theme.colors.primary} size={34} />
      </View>
      <Text style={[styles.title, {color: theme.colors.text}]}>
        {filtered ? 'No matching tasks' : 'A clear list, a clear mind'}
      </Text>
      <Text style={[styles.message, {color: theme.colors.textMuted}]}>
        {filtered
          ? 'Try changing your search or filter.'
          : 'Add your first task and make today count.'}
      </Text>
      {!filtered ? (
        <PressableScale
          onPress={onAdd}
          style={[styles.button, {backgroundColor: theme.colors.primary}]}>
          <Text style={styles.buttonLabel}>Add first task</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.body,
    fontWeight: '800',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: 56,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    transform: [{rotate: '-4deg'}],
    width: 72,
  },
  message: {
    fontSize: fontSize.body,
    lineHeight: 19,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
});
