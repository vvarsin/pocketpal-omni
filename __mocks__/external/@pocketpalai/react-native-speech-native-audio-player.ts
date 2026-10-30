/** Jest mock for the speech library's native PCM player. */
const NativeNeuralAudioPlayer = {
  playAudio: jest.fn(async () => undefined),
  stop: jest.fn(async () => undefined),
  pause: jest.fn(async () => false),
  resume: jest.fn(async () => false),
  isSpeaking: jest.fn(async () => false),
};

export default NativeNeuralAudioPlayer;
