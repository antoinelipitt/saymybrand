export type ModelConfig = {
  id: string;
  endpoint: string;
  name: string;
  provider: string;
  flag: string;
  buildInput: (text: string) => Record<string, unknown>;
  extractAudioUrl: (data: unknown) => string | null;
};

const getAudioUrl = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.audio_url === "string") return d.audio_url;
  if (d.audio && typeof d.audio === "object") {
    const a = d.audio as Record<string, unknown>;
    if (typeof a.url === "string") return a.url;
  }
  if (Array.isArray(d.audio) && d.audio[0]) {
    const a = d.audio[0] as Record<string, unknown>;
    if (typeof a.url === "string") return a.url;
  }
  return null;
};

export const TTS_MODELS: ModelConfig[] = [
  {
    id: "minimax-speech-02-hd",
    endpoint: "fal-ai/minimax/speech-02-hd",
    name: "MiniMax Speech-02 HD",
    provider: "MiniMax",
    flag: "🇨🇳",
    buildInput: (text) => ({ text, voice_setting: { voice_id: "Wise_Woman" } }),
    extractAudioUrl: getAudioUrl,
  },
  {
    id: "chatterbox",
    endpoint: "resemble-ai/chatterbox/text-to-speech",
    name: "Chatterbox",
    provider: "Resemble AI",
    flag: "🇺🇸",
    buildInput: (text) => ({ text }),
    extractAudioUrl: getAudioUrl,
  },
  {
    id: "inworld-tts",
    endpoint: "fal-ai/inworld-tts",
    name: "Inworld TTS-1.5 Max",
    provider: "Inworld",
    flag: "🇺🇸",
    buildInput: (text) => ({ text }),
    extractAudioUrl: getAudioUrl,
  },
];
