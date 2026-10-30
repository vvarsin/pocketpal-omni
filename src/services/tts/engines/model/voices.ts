import type {Voice} from '../../types';

/**
 * Voices of a chat model that speaks for itself (LFM3-Omni). The ids are the
 * `voice` values the model's "tts" chat template takes.
 */
export const MODEL_VOICES: Voice[] = [
  {
    id: 'female',
    name: 'Model voice (female)',
    engine: 'model',
    language: 'en',
    gender: 'f',
  },
  {
    id: 'male',
    name: 'Model voice (male)',
    engine: 'model',
    language: 'en',
    gender: 'm',
  },
];
