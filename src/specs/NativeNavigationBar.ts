import type {TurboModule} from 'react-native';
import {Platform, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  setNavigationBarDark(isDark: boolean): void;
  /**
   * Android 12+ wallpaper ("Material You") tonal palettes as `#RRGGBB`,
   * keyed `accent1_600`, `neutral2_100`, ... Empty below Android 12.
   */
  getWallpaperPalette(): Promise<Object>;
}

const NativeNavigationBar: Spec | null =
  Platform.OS === 'android'
    ? TurboModuleRegistry.getEnforcing<Spec>('NavigationBarModule')
    : null;

export default NativeNavigationBar;
