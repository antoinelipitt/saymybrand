export type ModelType = "audio" | "video";

export type ModelConfig = {
  id: string;
  endpoint: string;
  name: string;
  provider: string;
  flag: string;
  type: ModelType;
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

export const TIER_1_TOP3: ModelConfig[] = [
  {
    id: "elevenlabs-v3",
    endpoint: "fal-ai/elevenlabs/tts/eleven-v3",
    name: "ElevenLabs v3",
    provider: "ElevenLabs",
    flag: "🇺🇸",
    type: "audio",
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
    buildInput: (brand) => ({
      text: ttsPhrase(brand),
      voice_setting: { voice_id: "Wise_Woman" },
    }),
    extractMediaUrl: getMediaUrl,
  },
];

export const TIER_2_MORE: ModelConfig[] = [
  {
    id: "inworld-tts",
    endpoint: "fal-ai/inworld-tts",
    name: "Inworld TTS-1.5 Max",
    provider: "Inworld",
    flag: "🇺🇸",
    type: "audio",
    buildInput: (brand) => ({ text: ttsPhrase(brand) }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "chatterbox",
    endpoint: "fal-ai/chatterbox/text-to-speech",
    name: "Chatterbox",
    provider: "Resemble AI",
    flag: "🇺🇸",
    type: "audio",
    buildInput: (brand) => ({ text: ttsPhrase(brand) }),
    extractMediaUrl: getMediaUrl,
  },
];

export const TIER_3_VIDEO: ModelConfig[] = [
  {
    id: "veo-3.1-fast",
    endpoint: "fal-ai/veo3.1/fast",
    name: "Veo 3.1 Fast",
    provider: "Google DeepMind",
    flag: "🇺🇸",
    type: "video",
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
    buildInput: (brand) => ({
      prompt: videoSceneFor(brand),
      resolution: "480p",
      duration: "4",
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
    buildInput: (brand) => ({
      prompt: videoSceneFor(brand),
      resolution: "720p",
      duration: 3,
    }),
    extractMediaUrl: getMediaUrl,
  },
];

export const TIERS = {
  top3: TIER_1_TOP3,
  more: TIER_2_MORE,
  video: TIER_3_VIDEO,
} as const;

export type TierKey = keyof typeof TIERS;
