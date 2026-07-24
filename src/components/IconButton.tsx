import React from 'react';
import {StyleSheet} from 'react-native';
import type {LucideIcon} from 'lucide-react-native';

import {useAppTheme} from '@/theme/ThemeProvider';
import {radius} from '@/theme/tokens';

import {PressableScale} from './PressableScale';

type Props = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  selected?: boolean;
};

export function IconButton({icon: Icon, label, onPress, selected}: Props) {
  const {theme} = useAppTheme();

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityState={{selected}}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}>
      <Icon color={selected ? theme.colors.primary : theme.colors.text} size={18} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
