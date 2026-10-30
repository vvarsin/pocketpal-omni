import React from 'react';

import {runInAction} from 'mobx';

import {fireEvent, render} from '../../../../jest/test-utils';
import {modelStore, voiceModeStore} from '../../../store';

import {VoiceModeButton} from '../VoiceModeButton';

describe('VoiceModeButton', () => {
  beforeEach(() => {
    (voiceModeStore as any).reset();
    runInAction(() => {
      modelStore.deviceTier = 'high';
      modelStore.isContextLoading = false;
    });
  });

  it('renders nothing on a device that cannot run voice mode', () => {
    runInAction(() => {
      modelStore.deviceTier = 'low';
    });
    const {queryByTestId} = render(<VoiceModeButton onPress={jest.fn()} />);
    expect(queryByTestId('voice-mode-button')).toBeNull();
  });

  it('shows on a weaker device once turned on in Settings', () => {
    runInAction(() => {
      modelStore.deviceTier = 'low';
    });
    voiceModeStore.setUserVoiceModeOverride(true);
    const {getByTestId} = render(<VoiceModeButton onPress={jest.fn()} />);
    expect(getByTestId('voice-mode-button')).toBeTruthy();
  });

  it('hides on a capable device once turned off in Settings', () => {
    voiceModeStore.setUserVoiceModeOverride(false);
    const {queryByTestId} = render(<VoiceModeButton onPress={jest.fn()} />);
    expect(queryByTestId('voice-mode-button')).toBeNull();
  });

  it('starts voice mode on press, with no lock', () => {
    const onPress = jest.fn();
    const {getByTestId, queryByTestId} = render(
      <VoiceModeButton onPress={onPress} />,
    );
    fireEvent.press(getByTestId('voice-mode-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(queryByTestId('voice-mode-lock')).toBeNull();
  });

  it('keeps the primary look and no hint', () => {
    const {getByTestId} = render(<VoiceModeButton onPress={jest.fn()} />);
    const button = getByTestId('voice-mode-button');
    expect(button.props.accessibilityLabel).toBe('Start voice mode');
    expect(button.props.accessibilityHint).toBeUndefined();
    expect(button).toHaveStyle({backgroundColor: '#333333'});
  });

  it('is disabled while the model loads', () => {
    runInAction(() => {
      modelStore.isContextLoading = true;
    });
    const {getByTestId} = render(<VoiceModeButton onPress={jest.fn()} />);
    expect(getByTestId('voice-mode-button')).toBeDisabled();
  });
});
