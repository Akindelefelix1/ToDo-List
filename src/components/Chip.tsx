import React from 'react';
import {StyleSheet, Text} from 'react-native';

import {useAppTheme} from '@/theme/ThemeProvider';
import {fontSize, radius, spacing} from '@/theme/tokens';

import {PressableScale} from './PressableScale';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({label, selected, onPress}: Props) {
  const {theme} = useAppTheme();
  return (
    <PressableScale
      accessibilityLabel={`Show ${label.toLowerCase()} tasks`}
      accessibilityState={{selected}}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}>
      <Text
        style={[
          styles.label,
          selected ? styles.selectedLabel : {color: theme.colors.textMuted},
        ]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});
