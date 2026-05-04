import { NextResponse } from "next/server";
import { getFalClient } from "@/lib/fal";
import { TTS_MODELS, type ModelConfig } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

type ModelResult = {
  id: string;
  name: string;
  provider: string;
  flag: string;
  audioUrl: string | null;
  error: string | null;
};

const sanitizeBrand = (input: unknown): string | null => {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 50) return null;
  return trimmed;
};

const runModel = async (
  model: ModelConfig,
  prompt: string
): Promise<ModelResult> => {
  try {
    const fal = getFalClient();
    const result = await fal.subscribe(model.endpoint, {
      input: model.buildInput(prompt),
    });
    const audioUrl = model.extractAudioUrl(result.data);
    return {
      id: model.id,
      name: model.name,
      provider: model.provider,
      flag: model.flag,
      audioUrl,
      error: audioUrl ? null : "No audio URL in response",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      id: model.id,
      name: model.name,
      provider: model.provider,
      flag: model.flag,
      audioUrl: null,
      error: message,
    };
  }
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const brand = sanitizeBrand(body?.brand);

  if (!brand) {
    return NextResponse.json(
      { error: "Invalid brand name. Must be 1–50 characters." },
      { status: 400 }
    );
  }

  const prompt = `Welcome to ${brand}.`;
  const results = await Promise.all(
    TTS_MODELS.map((model) => runModel(model, prompt))
  );

  return NextResponse.json({ brand, prompt, results });
}
