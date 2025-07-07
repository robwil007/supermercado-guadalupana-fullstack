

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Product } from '../types';

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

interface AiResponse {
    responseText: string;
    recommendedProductIds: string[];
}

export const getChatResponse = async (history: ChatMessage[], products: Product[]): Promise<ChatMessage> => {
    const lastUserMessage = history[history.length - 1]?.content || "";
    
    const productCatalog = products.map(p => ({ id: p.id, name: p.name, category: p.category }));

    const prompt = `
        Eres "Guada", una asistente de compras amigable, servicial e inteligente para "Supermercado Guadalupana", una tienda de comestibles en Bolivia. Tu apariencia es la de un angelito servicial. Tu objetivo es ayudar a los clientes con sus preguntas sobre cocina, limpieza, productos y más.

        - Responde siempre de forma conversacional y amigable en español.
        - Se te proporcionará el historial de la conversación actual y una lista de productos disponibles en la tienda.
        - Cuando un cliente te pida una recomendación que pueda ser satisfecha con productos de la tienda (por ejemplo, "ingredientes para hacer salteñas" o "cómo quito una mancha de aceite"), DEBES basar tus sugerencias ÚNICAMENTE en la lista de productos proporcionada.
        - Tu respuesta DEBE ser un objeto JSON VÁLIDO con la siguiente estructura, y nada más:
        {
          "responseText": "Tu respuesta conversacional en español aquí. Si recomiendas productos, menciónalos por su nombre.",
          "recommendedProductIds": [una lista de los IDs de tipo string de los productos que recomiendas, o un array vacío si no recomiendas ninguno]
        }
        - No inventes productos. Si no encuentras un producto adecuado en la lista, informa amablemente al cliente que no lo tienes disponible en este momento.

        HISTORIAL DE LA CONVERSACIÓN:
        ${JSON.stringify(history)}

        CATÁLOGO DE PRODUCTOS DISPONIBLES (Usa los IDs para 'recommendedProductIds'):
        ${JSON.stringify(productCatalog)}

        LA ÚLTIMA PREGUNTA DEL CLIENTE ES: "${lastUserMessage}"

        Ahora, genera tu respuesta en el formato JSON especificado.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        try {
            const parsedData: AiResponse = JSON.parse(jsonStr);
            
            const recommendedProducts = parsedData.recommendedProductIds
                ? products.filter(p => parsedData.recommendedProductIds.includes(p.id))
                : [];
            
            return {
                role: 'assistant',
                content: parsedData.responseText,
                products: recommendedProducts.length > 0 ? recommendedProducts : undefined,
            };

        } catch (e) {
            console.error("Failed to parse JSON response from AI:", jsonStr, e);
            // Return a fallback response if JSON is invalid
            return {
                role: 'assistant',
                content: jsonStr || "No pude procesar la respuesta de la IA correctamente.",
            };
        }

    } catch (error) {
        console.error("Error fetching response from Gemini API:", error);
        throw new Error("No se pudo contactar al servicio de Asistente IA.");
    }
};
