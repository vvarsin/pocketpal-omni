import {useEffect} from 'react';
import {AppState} from 'react-native';

import NativeNavigationBar from '../specs/NativeNavigationBar';
import {uiStore} from '../store';

/**
 * Sets the Android navigation bar icons to contrast with the app's colour
 * scheme, and keeps the wallpaper (Material You) accents current: the user
 * may change the wallpaper while the app is in the background.
 */
export const useNavigationBarAppearance = (): void => {
  const isDark = uiStore.colorScheme === 'dark';

  useEffect(() => {
    NativeNavigationBar?.setNavigationBarDark(isDark);
  }, [isDark]);

  useEffect(() => {
    const native = NativeNavigationBar;
    if (!native?.getWallpaperPalette) {
      return;
    }
    const refresh = () => {
      native
        .getWallpaperPalette()
        .then(palette => uiStore.setWallpaperPalette(palette as never))
        .catch(error => {
          console.warn('[theme] wallpaper palette unavailable:', error);
        });
    };
    refresh();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => sub.remove();
  }, []);
};
