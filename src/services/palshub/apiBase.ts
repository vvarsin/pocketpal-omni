import {Platform} from 'react-native';
import {PALSHUB_API_BASE_URL} from '@env';

let baseOverride: string | undefined;

export const getApiBase = (): string => baseOverride ?? PALSHUB_API_BASE_URL;

export const setApiBaseOverride = (base: string | undefined): void => {
  if (__E2E__) {
    console.log('IAP_API_BASE_OVERRIDE', base ?? 'cleared');
    baseOverride = base;
  }
};

// PocketPalOmni does not announce in-app purchase support (no X-IAP-Capable)
export const clientHeaders = (): Record<string, string> => ({
  'X-Client-Platform': Platform.OS,
});
