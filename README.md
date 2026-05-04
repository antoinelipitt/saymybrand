# SayMyBrand

> How AI hears your brand.

A web app that lets anyone hear how the leading AI voice models pronounce a
given brand name — in one click, side by side. Built to help brands and AI
marketing teams audit their names before scaling AI-generated content (UGC,
ads, product videos).

## Stack

- Next.js 16 (App Router) on Vercel
- fal.ai unified API for all TTS models
- TypeScript + Tailwind CSS 4

## Setup

1. Copy `.env.example` to `.env.local` and add your `FAL_KEY`:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies and start the dev server:
   ```bash
   pnpm install
   pnpm dev
   ```
3. Open http://localhost:3000

## Where to put the fal.ai key

- **Local dev**: `.env.local` (file is gitignored)
- **Vercel**: Project Settings → Environment Variables → add `FAL_KEY`
  (or via CLI: `vercel env add FAL_KEY`)

## What's in v0

- Landing page + Hall of Shame (curated brands the AI keeps mispronouncing)
- One-shot test against 3 multilingual TTS models on fal.ai
  (MiniMax Speech-02 HD, Resemble Chatterbox, Inworld TTS-1.5 Max)
- Free for now, no auth, no payment — public demo to validate the idea

## Roadmap

- Add multilingual video models with native audio (Veo 3.1, Seedance 2.0, Happy Horse 1.0)
- Auth + Stripe credit packs (Starter €29, Pro €99, Enterprise on quote)
- Community voting → unique dataset of AI pronunciation accuracy
- Multi-language testing (5+ European languages)
