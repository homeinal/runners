interface RunData {
  distanceKm: number | null;
  paceSeconds: number | null;
  durationSeconds: number | null;
  calories: number | null;
  rawText: string;
}

interface VisionApiResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
    }>;
    error?: {
      code: number;
      message: string;
    };
  }>;
}

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
 * Extract running data from an image using Google Cloud Vision API
 */
export async function extractRunData(imageUrl: string): Promise<RunData> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_CLOUD_VISION_API_KEY environment variable is not set");
  }

  const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const requestBody = {
    requests: [
      {
        image: {
          source: {
            imageUri: imageUrl,
          },
        },
        features: [
          {
            type: "TEXT_DETECTION",
          },
        ],
      },
    ],
  };

  const response = await fetch(visionApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Vision API request failed: ${response.status} ${response.statusText}`);
  }

  const data: VisionApiResponse = await response.json();

  if (data.responses[0]?.error) {
    throw new Error(`Vision API error: ${data.responses[0].error.message}`);
  }

  const textAnnotations = data.responses[0]?.textAnnotations;
  if (!textAnnotations || textAnnotations.length === 0) {
    return {
      distanceKm: null,
      paceSeconds: null,
      durationSeconds: null,
      calories: null,
      rawText: "",
    };
  }

  // First annotation contains all detected text
  const rawText = textAnnotations[0].description;
  const parsedData = parseOcrText(rawText);

  return {
    ...parsedData,
    rawText,
  };
}
