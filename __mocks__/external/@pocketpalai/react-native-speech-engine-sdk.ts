/**
 * Jest mock for `@pocketpalai/react-native-speech/engine-sdk`: the subset
 * the model-voice engine uses (sentence chunking, markdown stripping and
 * the shared PCM player). The real entry point is untranspiled ESM.
 */

export const neuralAudioPlayer = {
  play: jest.fn(async () => undefined),
  playNative: jest.fn(async (start: () => Promise<void>) => start()),
  stop: jest.fn(async () => undefined),
  pause: jest.fn(async () => false),
  resume: jest.fn(async () => false),
  isSpeaking: jest.fn(async () => false),
};

export const stripMarkdown = jest.fn((text: string) => text);

export const TextChunker = {
  chunkBySentences: jest.fn((text: string) => {
    const chunks: {text: string; startIndex: number; endIndex: number}[] = [];
    const re = /[^.!?]+[.!?]*/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      chunks.push({
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
    return chunks;
  }),
};

export type TextChunk = {text: string; startIndex: number; endIndex: number};
