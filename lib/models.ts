export type ModelType = "audio" | "video";

export type ModelMeta = {
  id: string;
  name: string;
  provider: string;
  flag: string;
  type: ModelType;
  estimatedSeconds: number;
};

export type ModelConfig = ModelMeta & {
  endpoint: string;
  buildInput: (brand: string) => Record<string, unknown>;
  extractMediaUrl: (data: unknown) => string | null;
};

const getMediaUrl = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (typeof d.audio_url === "string") return d.audio_url;
  if (typeof d.video_url === "string") return d.video_url;
  if (typeof d.url === "string") return d.url;

  for (const key of ["audio", "video", "output"] as const) {
    const v = d[key];
    if (v && typeof v === "object") {
      const inner = v as Record<string, unknown>;
      if (typeof inner.url === "string") return inner.url;
    }
    if (Array.isArray(v) && v[0]) {
      const first = v[0] as Record<string, unknown>;
      if (typeof first.url === "string") return first.url;
    }
  }

  return null;
};

export const ttsPhrase = (brand: string) => `Welcome to ${brand}.`;

export const videoPhrase = (brand: string) =>
  `Welcome to ${brand}, the future starts here.`;

const videoSceneFor = (brand: string) =>
  `A spokesperson on camera, looking directly at the viewer, clearly says: "${videoPhrase(brand)}". Studio lighting, neutral background, professional ad style.`;

export const TTS_MODELS: ModelConfig[] = [
  {
    id: "elevenlabs-v3",
    endpoint: "fal-ai/elevenlabs/tts/eleven-v3",
    name: "ElevenLabs v3",
    provider: "ElevenLabs",
    flag: "🇺🇸",
    type: "audio",
    estimatedSeconds: 6,
    buildInput: (brand) => ({ text: ttsPhrase(brand) }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "gemini-flash-tts",
    endpoint: "fal-ai/gemini-3.1-flash-tts",
    name: "Gemini 3.1 Flash TTS",
    provider: "Google",
    flag: "🇺🇸",
    type: "audio",
    estimatedSeconds: 5,
    buildInput: (brand) => ({ prompt: ttsPhrase(brand) }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "minimax-speech-02-hd",
    endpoint: "fal-ai/minimax/speech-02-hd",
    name: "MiniMax Speech-02 HD",
    provider: "MiniMax",
    flag: "🇨🇳",
    type: "audio",
    estimatedSeconds: 7,
    buildInput: (brand) => ({
      text: ttsPhrase(brand),
      voice_setting: { voice_id: "Wise_Woman" },
    }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "inworld-tts",
    endpoint: "fal-ai/inworld-tts",
    name: "Inworld TTS-1.5 Max",
    provider: "Inworld",
    flag: "🇺🇸",
    type: "audio",
    estimatedSeconds: 6,
    buildInput: (brand) => ({ text: ttsPhrase(brand) }),
    extractMediaUrl: getMediaUrl,
  },
];

export const VIDEO_MODELS: ModelConfig[] = [
  {
    id: "veo-3.1-fast",
    endpoint: "fal-ai/veo3.1/fast",
    name: "Veo 3.1 Fast",
    provider: "Google DeepMind",
    flag: "🇺🇸",
    type: "video",
    estimatedSeconds: 40,
    buildInput: (brand) => ({
      prompt: videoSceneFor(brand),
      resolution: "720p",
      duration: "4s",
      generate_audio: true,
    }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "seedance-2.0-fast",
    endpoint: "bytedance/seedance-2.0/fast/text-to-video",
    name: "Seedance 2.0 Fast",
    provider: "ByteDance",
    flag: "🇨🇳",
    type: "video",
    estimatedSeconds: 30,
    buildInput: (brand) => ({
      prompt: videoSceneFor(brand),
      resolution: "480p",
      duration: "4",
      aspect_ratio: "16:9",
      generate_audio: true,
    }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "kling-v3-standard",
    endpoint: "fal-ai/kling-video/v3/standard/text-to-video",
    name: "Kling v3 Standard",
    provider: "Kuaishou",
    flag: "🇨🇳",
    type: "video",
    estimatedSeconds: 45,
    buildInput: (brand) => ({
      prompt: videoSceneFor(brand),
      duration: "3",
      generate_audio: true,
    }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "happy-horse-1.0",
    endpoint: "alibaba/happy-horse/text-to-video",
    name: "Happy Horse 1.0",
    provider: "Alibaba",
    flag: "🇨🇳",
    type: "video",
    estimatedSeconds: 45,
    buildInput: (brand) => ({
      prompt: videoSceneFor(brand),
      resolution: "720p",
      duration: 3,
    }),
    extractMediaUrl: getMediaUrl,
  },
];

export const TIERS = {
  tts: TTS_MODELS,
  video: VIDEO_MODELS,
} as const;

export type TierKey = keyof typeof TIERS;

const toMeta = (m: ModelConfig): ModelMeta => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
  flag: m.flag,
  type: m.type,
  estimatedSeconds: m.estimatedSeconds,
});

export const TIERS_META: Record<TierKey, ModelMeta[]> = {
  tts: TTS_MODELS.map(toMeta),
  video: VIDEO_MODELS.map(toMeta),
};

export const findModelById = (id: string): ModelConfig | undefined => {
  for (const tier of Object.values(TIERS)) {
    const found = tier.find((m) => m.id === id);
    if (found) return found;
  }
  return undefined;
};
