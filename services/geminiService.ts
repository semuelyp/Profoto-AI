import { GoogleGenAI } from "@google/genai";
import { GeneratedImageResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define 4 distinct styles for automatic generation
const STYLES = [
  {
    name: "Studio Minimalis",
    prompt: "Professional product photography, clean white background, soft studio lighting, high key, commercial e-commerce look, 4k resolution."
  },
  {
    name: "Elegan & Mewah",
    prompt: "Luxury product photography, dark moody background with texture, dramatic rim lighting, gold accents, premium cinematic look."
  },
  {
    name: "Alam & Natural",
    prompt: "Lifestyle product photography, placed on a wooden surface, natural sunlight dappling through leaves (bokeh), soft outdoor atmosphere."
  },
  {
    name: "Modern Pastel",
    prompt: "Modern artistic product photography, pastel colored geometric podiums, bright vivid lighting, pop art style, trendy aesthetic."
  }
];

/**
 * Helper to generate a single image
 */
const generateSingleImage = async (
  cleanBase64: string, 
  userPrompt: string, 
  style: { name: string, prompt: string }
): Promise<GeneratedImageResult> => {
  
  // Combine user input (if any) with the preset style
  const finalPrompt = userPrompt 
    ? `Bertindaklah sebagai fotografer produk. Subjek utama adalah gambar input. Ubah latar belakang sesuai deskripsi ini: "${userPrompt}". Gaya visual harus mengikuti arahan ini: ${style.prompt}. Pastikan produk terlihat realistis dan menyatu dengan background.`
    : `Bertindaklah sebagai fotografer produk profesional. Subjek utama adalah gambar input. Buat foto produk yang menakjubkan dengan gaya: ${style.prompt}. Pastikan pencahayaan dan bayangan realistis.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: finalPrompt },
        {
          inlineData: {
            data: cleanBase64,
            mimeType: 'image/jpeg',
          },
        },
      ],
    },
  });

  let imageUrl = '';
  
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break; // Found image, stop looking
      }
    }
  }

  if (!imageUrl) {
    throw new Error(`Gagal membuat variasi ${style.name}`);
  }

  return {
    imageUrl,
    styleName: style.name
  };
};

/**
 * Generates 4 variations of product photos in parallel.
 */
export const generateProductVariations = async (
  imageBase64: string,
  userPrompt: string
): Promise<GeneratedImageResult[]> => {
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Create 4 promises to run in parallel
    const promises = STYLES.map(style => 
      generateSingleImage(cleanBase64, userPrompt, style)
        .catch(err => {
          console.error(`Error generating style ${style.name}:`, err);
          return null; // Return null on error so Promise.all doesn't fail completely
        })
    );

    const results = await Promise.all(promises);
    
    // Filter out any failed requests
    const validResults = results.filter((res): res is GeneratedImageResult => res !== null);

    if (validResults.length === 0) {
      throw new Error("Gagal membuat gambar. Silakan coba lagi.");
    }

    return validResults;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};