import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured. Please set up AI Integrations or add OPENAI_API_KEY.");
    }
    openaiClient = new OpenAI({ 
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return openaiClient;
}

type FieldType = "title" | "description" | "maxsTake";

interface SpinRequest {
  field: FieldType;
  existingText?: string;
  productContext: {
    title?: string;
    description?: string;
    category?: string;
    price?: string;
  };
}

const SYSTEM_PROMPTS = {
  title: `You are a copywriter for Max's Picks, a pet product recommendation site run by Max, an adorable Maltipoo. 
Write catchy, playful product titles that are fun yet informative.
Keep titles under 8 words. Be creative but clear about what the product is.
Use alliteration, puns, or playful language when appropriate.
Do NOT include quotes around your response.`,

  description: `You are a copywriter for Max's Picks, a pet product recommendation site run by Max, an adorable Maltipoo.
Write engaging product descriptions in a friendly, playful corporate voice.
Keep descriptions to exactly 1-2 sentences, around 100-140 characters total.
Highlight key features and benefits without being too salesy.
Do NOT include quotes around your response.`,

  maxsTake: `You are Max, a fluffy Maltipoo with gray/silver and white fur and striking blue eyes. You're 3 years old and live in California.
Write a first-person review of this pet product from YOUR perspective as a dog.
Be enthusiastic, funny, and authentic. Use dog-related expressions naturally.
Reference things a dog would care about: smell, texture, taste, fun factor, comfort.
IMPORTANT: Keep it SHORT - under 180 characters (about 1-2 short sentences). Be specific to the product type - don't talk about chewing a shampoo or eating a bed.
Do NOT include quotes around your response.`
};

function buildUserPrompt(request: SpinRequest): string {
  const { field, existingText, productContext } = request;
  const { title, description, category, price } = productContext;
  
  let contextInfo = "";
  if (title) contextInfo += `Product: ${title}\n`;
  if (description) contextInfo += `Description: ${description}\n`;
  if (category) contextInfo += `Category: ${category}\n`;
  if (price) contextInfo += `Price: $${price}\n`;
  
  if (existingText && existingText.trim()) {
    return `${contextInfo}\nRewrite this ${field === "maxsTake" ? "Max's Take review" : field} in the brand voice:\n"${existingText}"`;
  }
  
  const fieldLabels = {
    title: "product title",
    description: "product description",
    maxsTake: "Max's Take review (first-person dog perspective)"
  };
  
  return `${contextInfo}\nGenerate a ${fieldLabels[field]} for this product.`;
}

export async function spinText(request: SpinRequest): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[request.field];
  const userPrompt = buildUserPrompt(request);
  
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 300,
    temperature: 0.8,
  });
  
  let text = response.choices[0]?.message?.content?.trim() || "";
  
  // Remove any surrounding quotes
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }
  
  // Enforce character limits - ensure final result is always <= limit
  if (request.field === "maxsTake" && text.length > 180) {
    // Try to cut at a sentence boundary first
    const maxLen = 180;
    let result = text.slice(0, maxLen);
    const lastPeriod = result.lastIndexOf('.');
    const lastExclaim = result.lastIndexOf('!');
    const lastSentence = Math.max(lastPeriod, lastExclaim);
    if (lastSentence > 100) {
      result = result.slice(0, lastSentence + 1);
    } else {
      // Truncate and add ellipsis, ensuring total <= 180
      result = text.slice(0, 177) + "...";
    }
    return result.slice(0, 180); // Final safety check
  }
  
  if (request.field === "description" && text.length > 160) {
    const truncated = text.slice(0, 157);
    const lastPeriod = truncated.lastIndexOf('.');
    if (lastPeriod > 100) {
      return truncated.slice(0, lastPeriod + 1);
    }
    return truncated + "...";
  }
  
  return text;
}
