import { fal } from "@fal-ai/client";

let configured = false;

export const getFalClient = () => {
  if (!configured) {
    const credentials = process.env.FAL_KEY;
    if (!credentials) {
      throw new Error(
        "FAL_KEY environment variable is not set. Add it to .env.local for local dev or to Vercel project env vars for production."
      );
    }
    fal.config({ credentials });
    configured = true;
  }
  return fal;
};
