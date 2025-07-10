/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a custom client for the Image Generation API. You may update this service, but you should not need to.
*/
import { getOpenAIClient } from './openai';

interface ImageGenerationResponse {
  url: string;
  error?: string;
}

class AssetGenerationService {
  private static instance: AssetGenerationService;
  private openaiClient = getOpenAIClient();

  static getInstance(): AssetGenerationService {
    if (!AssetGenerationService.instance) {
      AssetGenerationService.instance = new AssetGenerationService();
    }
    return AssetGenerationService.instance;
  }

  async generateImage(prompt: string): Promise<ImageGenerationResponse> {
    try {
      const response = await this.openaiClient.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      // Check if we got a valid response
      if (!response.data || response.data.length === 0) {
        return { url: "", error: "No image generated" };
      }

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        return { url: "", error: "No image URL returned" };
      }

      // Try to fetch the image to verify it exists
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          return { url: "", error: `Image not accessible: ${imageResponse.status}` };
        }
        
        // Check if we can parse as JSON (shouldn't be possible for an image)
        try {
          const text = await imageResponse.text();
          const errorData = JSON.parse(text);
          if (__DEV__) {
            console.error("[AssetGenerationService] Error response:", errorData);
          }
          return { url: "", error: errorData.error?.message || "Invalid response format" };
        } catch {
          // This is expected - image should not be JSON
          if (__DEV__) {
            console.log("[AssetGenerationService] Image generated successfully");
          }
          return { url: imageUrl };
        }
      } catch (fetchError) {
        if (__DEV__) {
          console.error("[AssetGenerationService] Invalid response format:", fetchError);
        }
        return { url: "", error: "Generated image could not be verified" };
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error("Image Generation Error:", error);
      }
      return { url: "", error: error.message || "Unknown error occurred" };
    }
  }
}

// Export the singleton instance
export const assetGenerationService = AssetGenerationService.getInstance();

/**
 * Convert aspect ratio to size format
 * @param aspectRatio The aspect ratio to convert
 * @returns The corresponding size format
 */
export function convertAspectRatioToSize(aspectRatio: string): "1024x1024" | "1536x1024" | "1024x1536" | "auto" {
  switch (aspectRatio) {
    case "1:1":
      return "1024x1024";
    case "3:2":
      return "1536x1024";
    case "2:3":
      return "1024x1536";
    default:
      return "auto";
  }
}
