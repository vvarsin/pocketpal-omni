import type {Mode} from './tokens';
import type {TokenColors} from './tokens/types';

/** Android 12+ tonal palettes, keyed `accent1_600`, `neutral2_100`, ... */
export type WallpaperPalette = Record<string, string>;

type AccentKey =
  | 'primary'
  | 'onPrimary'
  | 'primaryContainer'
  | 'onPrimaryContainer'
  | 'secondary'
  | 'onSecondary'
  | 'secondaryContainer'
  | 'onSecondaryContainer'
  | 'tertiary'
  | 'onTertiary'
  | 'tertiaryContainer'
  | 'onTertiaryContainer';

// Material 3 accent roles by tone, as Android maps its system palettes
const LIGHT_TONES: Record<AccentKey, [string, number]> = {
  primary: ['accent1', 600],
  onPrimary: ['accent1', 0],
  primaryContainer: ['accent1', 100],
  onPrimaryContainer: ['accent1', 900],
  secondary: ['accent2', 600],
  onSecondary: ['accent2', 0],
  secondaryContainer: ['accent2', 100],
  onSecondaryContainer: ['accent2', 900],
  tertiary: ['accent3', 600],
  onTertiary: ['accent3', 0],
  tertiaryContainer: ['accent3', 100],
  onTertiaryContainer: ['accent3', 900],
};

const DARK_TONES: Record<AccentKey, [string, number]> = {
  primary: ['accent1', 200],
  onPrimary: ['accent1', 800],
  primaryContainer: ['accent1', 700],
  onPrimaryContainer: ['accent1', 100],
  secondary: ['accent2', 200],
  onSecondary: ['accent2', 800],
  secondaryContainer: ['accent2', 700],
  onSecondaryContainer: ['accent2', 100],
  tertiary: ['accent3', 200],
  onTertiary: ['accent3', 800],
  tertiaryContainer: ['accent3', 700],
  onTertiaryContainer: ['accent3', 100],
};

/**
 * The accent roles of the theme taken from the phone's wallpaper colors.
 * Surfaces and text stay on the app's own neutrals, so only the accents
 * (buttons, chips, your message bubbles, highlights) follow the wallpaper.
 * Empty when the palette is incomplete (Android 11 and older, iOS).
 */
export function wallpaperAccentColors(
  palette: WallpaperPalette | null,
  mode: Mode,
): Partial<TokenColors> {
  if (!palette) {
    return {};
  }
  const tones = mode === 'dark' ? DARK_TONES : LIGHT_TONES;
  const colors: Partial<Record<AccentKey, string>> = {};
  for (const [key, [group, tone]] of Object.entries(tones)) {
    const value = palette[`${group}_${tone}`];
    if (!value) {
      return {};
    }
    colors[key as AccentKey] = value;
  }
  const inverse = palette[mode === 'dark' ? 'accent1_600' : 'accent1_200'];
  return {
    ...colors,
    ...(inverse ? {inversePrimary: inverse} : {}),
  } as Partial<TokenColors>;
}
