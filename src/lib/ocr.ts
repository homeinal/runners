import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { readFile } from 'fs/promises';

interface RunData {
  distanceKm: number | null;
  paceSeconds: number | null;
  durationSeconds: number | null;
  calories: number | null;
  rawText: string;
}

const RunDataSchema = z.object({
  distanceKm: z.number().nullable(),
  paceSeconds: z.number().nullable(),
  durationSeconds: z.number().nullable(),
  calories: z.number().nullable(),
  rawText: z.string(),
});

/**
 * Parse extracted OCR text to find running metrics
 */
export function parseOcrText(text: string): Omit<RunData, "rawText"> {
  const normalized = text.toLowerCase();

  // Distance patterns: "15.32 km", "15.32km", "15.32 킬로미터"
  const distancePattern = /(\d+\.?\d*)\s*(?:km|킬로미터)/i;
  const distanceMatch = text.match(distancePattern);
  const distanceKm = distanceMatch ? parseFloat(distanceMatch[1]) : null;

  // Pace patterns: "5'10\"", "5:10", "5'10''", "5분 10초"
  const pacePattern1 = /(\d+)[':](\d+)(?:"|'')?/; // 5'10" or 5:10
  const pacePattern2 = /(\d+)분\s*(\d+)초/; // 5분 10초
  let paceSeconds: number | null = null;

  const paceMatch1 = text.match(pacePattern1);
  if (paceMatch1) {
    const minutes = parseInt(paceMatch1[1], 10);
    const seconds = parseInt(paceMatch1[2], 10);
    paceSeconds = minutes * 60 + seconds;
  } else {
    const paceMatch2 = text.match(pacePattern2);
    if (paceMatch2) {
      const minutes = parseInt(paceMatch2[1], 10);
      const seconds = parseInt(paceMatch2[2], 10);
      paceSeconds = minutes * 60 + seconds;
    }
  }

  // Duration patterns: "1:15:30", "01:15:30", "1시간 15분 30초"
  const durationPattern1 = /(\d+):(\d+):(\d+)/; // 1:15:30
  const durationPattern2 = /(\d+)시간\s*(\d+)분\s*(\d+)초/; // 1시간 15분 30초
  let durationSeconds: number | null = null;

  const durationMatch1 = text.match(durationPattern1);
  if (durationMatch1) {
    const hours = parseInt(durationMatch1[1], 10);
    const minutes = parseInt(durationMatch1[2], 10);
    const seconds = parseInt(durationMatch1[3], 10);
    durationSeconds = hours * 3600 + minutes * 60 + seconds;
  } else {
    const durationMatch2 = text.match(durationPattern2);
    if (durationMatch2) {
      const hours = parseInt(durationMatch2[1], 10);
      const minutes = parseInt(durationMatch2[2], 10);
      const seconds = parseInt(durationMatch2[3], 10);
      durationSeconds = hours * 3600 + minutes * 60 + seconds;
    }
  }

  // Calories patterns: "450 kcal", "450kcal", "450 칼로리"
  const caloriesPattern = /(\d+)\s*(?:kcal|칼로리)/i;
  const caloriesMatch = text.match(caloriesPattern);
  const calories = caloriesMatch ? parseInt(caloriesMatch[1], 10) : null;

  return {
    distanceKm,
    paceSeconds,
    durationSeconds,
    calories,
  };
}

/**
 * Convert a file path or URL to a base64 data URL
 */
async function imageToBase64(imageUrl: string): Promise<string> {
  // Already a data URL
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // File path - read and convert to base64
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    const buffer = await readFile(imageUrl);
    const base64 = buffer.toString('base64');
    const mimeType = imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  }

  // Return URL as-is for OpenAI to fetch
  return imageUrl;
}

/**
 * Extract running data from an image using OpenAI gpt-4o-mini
 */
export async function extractRunData(imageUrl: string): Promise<RunData> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const openai = new OpenAI({ apiKey });

  // Convert image to base64 if needed
  const imageData = await imageToBase64(imageUrl);

  const systemPrompt = `You are an expert at extracting running metrics from screenshots.

Extract the following data from running app screenshots:
- Distance in kilometers (e.g., 5.32, 10.0)
- Pace per km in total seconds (e.g., 5'30" = 330 seconds, "5분 30초" = 330 seconds)
- Total duration in seconds (e.g., 1:15:30 = 4530 seconds, "1시간 15분" = 4500 seconds)
- Calories burned

Handle both English and Korean text:
- Distance: "km", "킬로미터"
- Pace: "5'30\"", "5:30", "5분 30초"
- Duration: "1:15:30", "1시간 15분 30초"
- Calories: "kcal", "칼로리"

Return null for any metric not found. Include all text you can see in rawText.`;

  const response = await openai.responses.parse({
    model: 'gpt-4o-mini',
    input: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_image',
            image_url: imageData,
            detail: 'high',
          },
          {
            type: 'input_text',
            text: 'Extract running metrics from this screenshot.',
          },
        ],
      },
    ],
    text: {
      format: zodTextFormat(RunDataSchema, 'run_data'),
    },
  });

  const result = response.output_parsed;

  if (!result) {
    return {
      distanceKm: null,
      paceSeconds: null,
      durationSeconds: null,
      calories: null,
      rawText: "",
    };
  }

  return result as RunData;
}
