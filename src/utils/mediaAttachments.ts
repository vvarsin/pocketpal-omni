/** Audio formats llama.rn hands to a projector that hears (input_audio). */
const AUDIO_ATTACHMENT_RE = /\.(wav|mp3)$/i;

/**
 * True when a message attachment is a sound file rather than an image.
 * Attachments share the message's `imageUris` list; models that hear audio
 * (LFM3-Omni and other omni models) take them as input_audio parts.
 */
export function isAudioAttachment(uri: string): boolean {
  return AUDIO_ATTACHMENT_RE.test(uri.split('?')[0]);
}

export type MediaMessagePart =
  | {type: 'image_url'; image_url: {url: string}}
  | {type: 'input_audio'; input_audio: {format: 'wav' | 'mp3'; url: string}};

/** The chat-message part for one attachment. */
export function toMediaMessagePart(uri: string): MediaMessagePart {
  if (isAudioAttachment(uri)) {
    const format = uri.split('?')[0].toLowerCase().endsWith('.mp3')
      ? 'mp3'
      : 'wav';
    return {type: 'input_audio', input_audio: {format, url: uri}};
  }
  return {type: 'image_url', image_url: {url: uri}};
}
