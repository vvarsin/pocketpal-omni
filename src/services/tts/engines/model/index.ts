import * as RNFS from '@dr.pogodin/react-native-fs';
import {
  TextChunker,
  neuralAudioPlayer,
  stripMarkdown,
  type TextChunk,
} from '@pocketpalai/react-native-speech/engine-sdk';
import NativeNeuralAudioPlayer from '@pocketpalai/react-native-speech/lib/module/NativeAudioPlayer';
import type {LlamaContext} from 'llama.rn';

import {ttsRuntime} from '../../runtime';
import type {Engine, StreamOptions, StreamingHandle, Voice} from '../../types';
import {MODEL_VOICES} from './voices';

/** Bytes of the 16-bit mono WAV header the native speech writer emits. */
const WAV_HEADER_BYTES = 44;

/** Characters per synthesis call: short enough for a quick first sound. */
const CHUNK_CHARS = 220;

interface SpeechSource {
  context: LlamaContext;
}

/**
 * The loaded chat model's context when its projector can speak, else null.
 * Required lazily: the store imports the TTS service.
 */
const getSpeechSource = (): SpeechSource | null => {
  const {modelStore} = require('../../../../store');
  if (!modelStore.isSpeechOutputActive || !modelStore.context) {
    return null;
  }
  return {context: modelStore.context as LlamaContext};
};

const speechDir = `${RNFS.CachesDirectoryPath}/model-speech`;

/**
 * Speech by the chat model itself, for omni models such as LFM3-Omni whose
 * projector carries an audio generator. Nothing to download: the voice is
 * part of the model the user already loaded. The model is busy while it
 * writes a reply, so a streamed reply is spoken once its text is complete,
 * one chunk ahead of playback.
 */
export class ModelVoiceEngine implements Engine {
  readonly id = 'model' as const;

  private generation = 0;

  async isInstalled(): Promise<boolean> {
    return getSpeechSource() !== null;
  }

  async getVoices(): Promise<Voice[]> {
    return MODEL_VOICES;
  }

  async loadInto(): Promise<void> {
    // The voice lives in the loaded chat model; playback uses the shared
    // native PCM player, which needs no engine of its own.
  }

  async play(text: string, voice: Voice): Promise<void> {
    await ttsRuntime.acquire(this, () =>
      this.speakChunks(this.chunk(text), voice, ++this.generation),
    );
  }

  playStreaming(
    voice: Voice,
    waitFor?: Promise<void>,
    streamOpts?: StreamOptions,
  ): StreamingHandle {
    let text = '';
    let done = false;
    const gen = ++this.generation;
    const ready = (waitFor ?? Promise.resolve()).catch(() => undefined);

    return {
      appendText: (chunk: string) => {
        if (!done) {
          text += chunk;
        }
      },
      finalize: async () => {
        if (done) {
          return;
        }
        done = true;
        await ready;
        if (gen !== this.generation) {
          return;
        }
        const chunks = this.chunk(text);
        await ttsRuntime.acquire(this, () =>
          this.speakChunks(chunks, voice, gen, streamOpts),
        );
      },
      cancel: async () => {
        done = true;
        await this.stop();
      },
    };
  }

  async stop(): Promise<void> {
    this.generation++;
    const source = getSpeechSource();
    if (source) {
      // Interrupts a speech generation in flight between two audio frames
      await source.context.stopCompletion().catch(() => undefined);
    }
    await neuralAudioPlayer.stop();
  }

  private chunk(text: string): TextChunk[] {
    return TextChunker.chunkBySentences(stripMarkdown(text), CHUNK_CHARS)
      .map(c => ({...c, text: c.text.trim()}))
      .filter(c => c.text.length > 0);
  }

  /** Synthesizes chunk n+1 while chunk n plays. */
  private async speakChunks(
    chunks: TextChunk[],
    voice: Voice,
    gen: number,
    streamOpts?: StreamOptions,
  ): Promise<void> {
    if (chunks.length === 0) {
      return;
    }
    await RNFS.mkdir(speechDir).catch(() => undefined);

    let next = this.synthesize(chunks[0].text, voice, gen, 0);
    for (let i = 0; i < chunks.length; i++) {
      const audio = await next;
      if (!audio || gen !== this.generation) {
        return;
      }
      next =
        i + 1 < chunks.length
          ? this.synthesize(chunks[i + 1].text, voice, gen, i + 1)
          : Promise.resolve(null);
      streamOpts?.onProgress?.({
        chunkText: chunks[i].text,
        streamRange: {start: chunks[i].startIndex, end: chunks[i].endIndex},
        chunkIndex: i,
        batchIndex: 0,
      });
      await neuralAudioPlayer.playNative(() =>
        NativeNeuralAudioPlayer.playAudio(audio.pcmBase64, {
          sampleRate: audio.sampleRate,
          channels: 1,
        }),
      );
      RNFS.unlink(audio.path).catch(() => undefined);
    }
    await next.catch(() => null);
  }

  private async synthesize(
    text: string,
    voice: Voice,
    gen: number,
    index: number,
  ): Promise<{path: string; sampleRate: number; pcmBase64: string} | null> {
    const source = getSpeechSource();
    if (!source || gen !== this.generation) {
      return null;
    }
    const outPath = `${speechDir}/speech-${gen}-${index}.wav`;
    const result = await source.context.generateSpeech({
      text,
      out_path: outPath,
      voice: voice.id,
      language: 'en',
    });
    if (result.interrupted || result.samples === 0) {
      RNFS.unlink(result.path).catch(() => undefined);
      return null;
    }
    const pcmBase64 = await RNFS.read(
      result.path,
      result.samples * 2,
      WAV_HEADER_BYTES,
      'base64',
    );
    return {path: result.path, sampleRate: result.sampleRate, pcmBase64};
  }
}
