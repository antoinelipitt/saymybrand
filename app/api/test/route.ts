import { NextResponse } from "next/server";
import { getFalClient } from "@/lib/fal";
import {
  TIERS,
  ttsPhrase,
  videoPhrase,
  type ModelConfig,
  type TierKey,
} from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 300;

type ModelResult = {
  id: string;
  name: string;
  provider: string;
  flag: string;
  type: "audio" | "video";
  mediaUrl: string | null;
  error: string | null;
};

const sanitizeBrand = (input: unknown): string | null => {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 50) return null;
  return trimmed;
};

const isTierKey = (input: unknown): input is TierKey =>
  typeof input === "string" && input in TIERS;

const runModel = async (
  model: ModelConfig,
  brand: string
): Promise<ModelResult> => {
  try {
    const fal = getFalClient();
    const result = await fal.subscribe(model.endpoint, {
      input: model.buildInput(brand),
    });
    const mediaUrl = model.extractMediaUrl(result.data);
    return {
      id: model.id,
      name: model.name,
      provider: model.provider,
      flag: model.flag,
      type: model.type,
      mediaUrl,
      error: mediaUrl ? null : "No media URL in response",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      id: model.id,
      name: model.name,
      provider: model.provider,
      flag: model.flag,
      type: model.type,
      mediaUrl: null,
      error: message,
    };
  }
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const brand = sanitizeBrand(body?.brand);
  const tier: TierKey = isTierKey(body?.tier) ? body.tier : "top3";

  if (!brand) {
    return NextResponse.json(
      { error: "Invalid brand name. Must be 1–50 characters." },
      { status: 400 }
    );
  }

  const prompt = tier === "video" ? videoPhrase(brand) : ttsPhrase(brand);
  const models = TIERS[tier];
  const results = await Promise.all(
    models.map((model) => runModel(model, brand))
  );

  return NextResponse.json({ brand, prompt, tier, results });
}
