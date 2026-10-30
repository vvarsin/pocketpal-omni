import {observable, runInAction} from 'mobx';

import {l10n, supportedLanguages} from '../../src/locales';

export class UIStore {
  static readonly GROUP_KEYS = {
    READY_TO_USE: 'ready_to_use',
    AVAILABLE_TO_DOWNLOAD: 'available_to_download',
  } as const;
}

const colorScheme = observable.box<'light' | 'dark'>('light');
const setColorScheme = (value: 'light' | 'dark') =>
  runInAction(() => colorScheme.set(value));

export const mockUiStore = {
  get colorScheme() {
    return colorScheme.get();
  },
  set colorScheme(value: 'light' | 'dark') {
    setColorScheme(value);
  },
  autoNavigatetoChat: false,
  benchmarkShareDialog: {
    shouldShow: true,
  },
  pageStates: {
    modelsScreen: {
      filters: [],
      expandedGroups: {
        [UIStore.GROUP_KEYS.READY_TO_USE]: true,
      },
    },
  },
  language: 'en',
  supportedLanguages: [...supportedLanguages],
  l10n: l10n.en,
  setValue: jest.fn(),
  displayMemUsage: false,
  useWallpaperColors: true,
  wallpaperPalette: null as Record<string, string> | null,
  get activeWallpaperPalette() {
    return this.useWallpaperColors ? this.wallpaperPalette : null;
  },
  setUseWallpaperColors: jest.fn(function (
    this: {useWallpaperColors: boolean},
    value: boolean,
  ) {
    this.useWallpaperColors = value;
  }),
  setWallpaperPalette: jest.fn(function (
    this: {wallpaperPalette: Record<string, string> | null},
    palette: Record<string, string> | null,
  ) {
    this.wallpaperPalette =
      palette && Object.keys(palette).length > 0 ? palette : null;
  }),
  setAutoNavigateToChat: jest.fn(),
  setColorScheme: jest.fn(setColorScheme),
  setDisplayMemUsage: jest.fn(),
  setBenchmarkShareDialogPreference: jest.fn(),
  showError: jest.fn(),
  setChatWarning: jest.fn(),
  clearChatWarning: jest.fn(),
  toolCompatWarnedModels: [] as string[],
  hasWarnedToolCompat: jest.fn(() => false),
  markToolCompatWarned: jest.fn(),
  hasCompletedOnboarding: true,
  onboardingTopicsSnapshot: [] as string[],
  onboardingState: {
    currentStep: 1 as 1 | 2 | 3 | 4 | 5 | 6,
    selectedTopic: null as string | null,
    selectedModelId: null as string | null,
  },
  setOnboardingStep: jest.fn(),
  setOnboardingTopic: jest.fn(),
  setOnboardingModelId: jest.fn(),
  completeOnboarding: jest.fn(),
  resetOnboarding: jest.fn(),
  replayOnboarding: jest.fn(),
  dismissedDownloadIds: [] as string[],
  isDownloadBannerDismissed: jest.fn(() => false),
  dismissDownloadBanner: jest.fn(),
  clearDownloadBannerDismissal: jest.fn(),
};
