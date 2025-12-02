import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

export const parseReceiptImage = async (base64Image: string): Promise<Partial<Transaction>> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, though could be png
              data: base64Image
            }
          },
          {
            text: "Extract transaction details from this receipt. Return JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING, description: "A general category like Food, Transport, Utilities" },
            items: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["merchant", "amount", "date"]
        }
      }
    });

    const text = response.text;
    if (!text) return {};
    
    const data = JSON.parse(text);
    return {
      merchant: data.merchant,
      date: data.date,
      amount: data.amount,
      category: data.category || 'Uncategorized',
      type: TransactionType.EXPENSE,
      description: data.items ? data.items.join(', ') : undefined
    };

  } catch (error) {
    console.error("Error parsing receipt:", error);
    return {};
  }
};

export const suggestCategory = async (merchant: string, description?: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Categorize this transaction into a simple 1-word category (e.g., Food, Transport, Shopping, Utilities, Entertainment, Health). 
      Merchant: ${merchant}
      Description: ${description || ''}
      Only return the category name.`,
    });
    return response.text?.trim() || 'Uncategorized';
  } catch (error) {
    return 'Uncategorized';
  }
};

export const getFinancialInsights = async (
  transactions: Transaction[],
  previousInsights: string[] = []
): Promise<string> => {
  try {
    // Limit transaction history to last 20 for prompt size optimization if needed, 
    // but flash handles large context well.
    const recentTx = transactions.slice(0, 50).map(t => 
      `${t.date}: ${t.merchant} (${t.category}) - $${t.amount} [${t.type}]`
    ).join('\n');

    const prompt = `
      Analyze these financial transactions and provide 3 brief, actionable insights or savings tips.
      Focus on spending habits, recurring charges, or unusual expenses.
      Keep it encouraging and concise.
      
      Transactions:
      ${recentTx}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text || "No insights available yet.";
  } catch (error) {
    console.error("Error getting insights:", error);
    return "Unable to generate insights at this moment.";
  }
};
