import React, {useContext} from 'react';
import {Pressable, StyleSheet} from 'react-native';

import {observer} from 'mobx-react';

import {useTheme} from '../../hooks';
import {modelStore, voiceModeStore} from '../../store';
import {L10nContext} from '../../utils';
import {VoiceWaveformIcon} from '../../assets/icons';

const SIZE = 40;
const HIT_SLOP = 2;

interface VoiceModeButtonProps {
  onPress: () => void;
}

/**
 * The composer's voice-mode button, shown in Send's place while the input
 * is empty.
 */
export const VoiceModeButton: React.FC<VoiceModeButtonProps> = observer(
  ({onPress}) => {
    const theme = useTheme();
    const l10n = useContext(L10nContext);

    if (!voiceModeStore.supported) {
      return null;
    }
    const loading = modelStore.isContextLoading;

    return (
      <Pressable
        onPress={onPress}
        disabled={loading}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={l10n.voiceMode.startLabel}
        accessibilityState={{disabled: loading}}
        testID="voice-mode-button"
        style={[
          styles.button,
          {backgroundColor: theme.colors.primary},
          loading && styles.disabled,
        ]}>
        <VoiceWaveformIcon
          width={22}
          height={22}
          color={theme.colors.onPrimary}
        />
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
