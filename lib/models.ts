export type ModelType = "audio" | "video";

export type ModelConfig = {
  id: string;
  endpoint: string;
  name: string;
  provider: string;
  flag: string;
  type: ModelType;
  buildInput: (text: string) => Record<string, unknown>;
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

const ttsInput = (text: string) => ({ text });

export const TIER_1_TOP3: ModelConfig[] = [
  {
    id: "gemini-flash-tts",
    endpoint: "fal-ai/gemini-3.1-flash-tts",
    name: "Gemini 3.1 Flash TTS",
    provider: "Google",
    flag: "🇺🇸",
    type: "audio",
    buildInput: (text) => ({ prompt: text }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "minimax-speech-02-hd",
    endpoint: "fal-ai/minimax/speech-02-hd",
    name: "MiniMax Speech-02 HD",
    provider: "MiniMax",
    flag: "🇨🇳",
    type: "audio",
    buildInput: (text) => ({ text, voice_setting: { voice_id: "Wise_Woman" } }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "inworld-tts",
    endpoint: "fal-ai/inworld-tts",
    name: "Inworld TTS-1.5 Max",
    provider: "Inworld",
    flag: "🇺🇸",
    type: "audio",
    buildInput: ttsInput,
    extractMediaUrl: getMediaUrl,
  },
];

export const TIER_2_MORE: ModelConfig[] = [
  {
    id: "chatterbox",
    endpoint: "fal-ai/chatterbox/text-to-speech",
    name: "Chatterbox",
    provider: "Resemble AI",
    flag: "🇺🇸",
    type: "audio",
    buildInput: ttsInput,
    extractMediaUrl: getMediaUrl,
  },
];

const videoPrompt = (text: string) =>
  `A spokesperson on camera, looking directly at the viewer, clearly says: "${text}". Studio lighting, neutral background, professional ad style.`;

export const TIER_3_VIDEO: ModelConfig[] = [
  {
    id: "veo-3.1",
    endpoint: "fal-ai/veo3.1",
    name: "Veo 3.1",
    provider: "Google DeepMind",
    flag: "🇺🇸",
    type: "video",
    buildInput: (text) => ({ prompt: videoPrompt(text), duration: "5s" }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "seedance-2.0",
    endpoint: "fal-ai/bytedance/seedance-2.0/text-to-video",
    name: "Seedance 2.0",
    provider: "ByteDance",
    flag: "🇨🇳",
    type: "video",
    buildInput: (text) => ({ prompt: videoPrompt(text) }),
    extractMediaUrl: getMediaUrl,
  },
  {
    id: "happy-horse-1.0",
    endpoint: "fal-ai/alibaba/happy-horse/text-to-video",
    name: "Happy Horse 1.0",
    provider: "Alibaba",
    flag: "🇨🇳",
    type: "video",
    buildInput: (text) => ({ prompt: videoPrompt(text) }),
    extractMediaUrl: getMediaUrl,
  },
];

export const TIERS = {
  top3: TIER_1_TOP3,
  more: TIER_2_MORE,
  video: TIER_3_VIDEO,
} as const;

export type TierKey = keyof typeof TIERS;

export const TIER_LABELS: Record<TierKey, { title: string; subtitle: string }> = {
  top3: {
    title: "Top 3 multilingual TTS",
    subtitle: "Most-used multilingual TTS available on fal.ai",
  },
  more: {
    title: "More TTS models",
    subtitle: "Other multilingual TTS models worth a listen",
  },
  video: {
    title: "AI video models",
    subtitle: "Watch a spokesperson say your brand. Takes 30–60s.",
  },
};
