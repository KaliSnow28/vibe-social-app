import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

const aiRouter = Router();

aiRouter.post("/ai/caption", async (req, res) => {
  try {
    const { imageDescription, style, tone } = req.body as {
      imageDescription?: string;
      style?: string;
      tone?: string;
    };

    if (!imageDescription) {
      res.status(400).json({ error: "imageDescription is required" });
      return;
    }

    const systemPrompt = `You are a creative social media content writer for the "Vibe" app. Generate engaging, authentic captions for social media posts. Keep captions concise (under 150 chars for main caption), include 3-5 relevant hashtags, and match the requested tone. Return JSON with: { caption: string, hashtags: string[], alternatives: string[] }`;

    const userPrompt = `Generate a social media caption for this: "${imageDescription}". Style: ${style ?? "casual"}. Tone: ${tone ?? "fun and engaging"}.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as {
      caption?: string;
      hashtags?: string[];
      alternatives?: string[];
    };

    res.json({
      caption: parsed.caption ?? "Check this out! ✨",
      hashtags: parsed.hashtags ?? ["#vibe", "#trending"],
      alternatives: parsed.alternatives ?? [],
    });
  } catch (err) {
    console.error("Caption generation error:", err);
    res.status(500).json({ error: "Failed to generate caption" });
  }
});

aiRouter.post("/ai/generate-image", async (req, res) => {
  try {
    const { prompt, size } = req.body as {
      prompt?: string;
      size?: "1024x1024" | "512x512" | "256x256";
    };

    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const validSizes = ["1024x1024", "512x512", "256x256"] as const;
    const imageSize = validSizes.includes(size as typeof validSizes[number])
      ? (size as typeof validSizes[number])
      : "1024x1024";

    const buffer = await generateImageBuffer(prompt, imageSize);
    res.json({ b64_json: buffer.toString("base64") });
  } catch (err) {
    console.error("Image generation error:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

aiRouter.post("/ai/hashtags", async (req, res) => {
  try {
    const { content } = req.body as { content?: string };

    if (!content) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 256,
      messages: [
        {
          role: "system",
          content: "Generate relevant trending hashtags for social media posts. Return JSON with: { hashtags: string[] } — 10 hashtags max, include the # symbol.",
        },
        {
          role: "user",
          content: `Generate hashtags for this social media post: "${content}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { hashtags?: string[] };
    res.json({ hashtags: parsed.hashtags ?? ["#vibe", "#trending"] });
  } catch (err) {
    console.error("Hashtag generation error:", err);
    res.status(500).json({ error: "Failed to generate hashtags" });
  }
});

export default aiRouter;
