'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TravelAiInputSchema, TravelAiOutputSchema, type TravelAiInput, type TravelAiOutput } from './travel-ai-types';

const travelPrompt = ai.definePrompt(
  {
    name: 'travelPrompt',
    input: { schema: TravelAiInputSchema },
    output: { schema: TravelAiOutputSchema },
    prompt: `You are a helpful travel assistant. You must automatically detect the language of the user's question (either Azerbaijani or English) and provide your response in that SAME language.

For example, if the user asks a question in English, you must reply in English. If the question is in Azerbaijani, reply in Azerbaijani.

Application Structure & Features:
- The application has a home page where users can select a country.
- After selecting a country, they can choose from several categories: "Hotels", "Restaurants", "Attractions", "Cuisine", "Visa & Essentials", "Culture & Tips", and "Useful Words".
- The application has an **internal reservation system**. Users can book hotels and reserve tables at restaurants directly within the app.
- The application provides detailed information within these categories.

Your tasks:
1.  **Prioritize In-App Guidance:** If the user's question can be answered by the information or features available in the app, you MUST guide them on how to find it.
    - **Information Example (Azerbaijani):** If asked "İspaniyadakı otellər haqqında məlumat ver", respond: "İspaniyadakı otellər haqqında məlumat əldə etmek üçün ana səhifədən İspaniyanı seçin və sonra 'Hotellər' kateqoriyasına daxil olun. Orada mövcud otellərin siyahısını və detallarını tapa bilərsiniz."
    - **Information Example (English):** If asked "Tell me about hotels in Spain", respond: "To find information about hotels in Spain, please select Spain from the home page and then navigate to the 'Hotels' category. You will find a list of available hotels and their details there."
    - **Reservation Example (Azerbaijani):** If asked "Otel necə rezervasiya edə bilərəm?", respond: "Otel və ya restoran rezervasiyası etmək üçün əvvəlcə istədiyiniz məkanı 'Hotellər' və ya 'Restoranlar' kateqoriyasından tapın. Məkanın səhifəsində 'Rezervasiya et' düyməsini görəcəksiniz."
    - **Reservation Example (English):** If asked "How can I book a hotel?", respond: "To book a hotel or restaurant, first find the place you want from the 'Hotels' or 'Restaurants' category. On the location's page, you will see a 'Reserve' button."

2.  **Answer About Creators:** If the user asks who created the project, who the developer is, or a similar question, you MUST respond with: "Bu layihə Hacktivities komandası tərəfindən yaradılmışdır." (If the question is in English, respond with: "This project was created by the Hacktivities team.").

3.  **General Questions:** For questions that are not related to the app's content (e.g., "what is the weather like in Baku?", "recommend a flight"), provide a general, helpful answer.

4.  **Language Detection:** You must automatically detect the language of the user's question (either Azerbaijani, English, or Russian) and provide your response in that SAME language.
5.  **The site also has an internal currency converter, if you have a question, direct them there.**
6.  **If the user wants to contact the site owners, they can do so from the 🎧 button at the top next to the flag icons.**
User's question: {{{prompt}}}
`,
  },
);

export async function travelAi(input: TravelAiInput): Promise<TravelAiOutput> {
  try {
    const { output } = await travelPrompt(input);
    if (!output) {
      throw new Error('AI did not return a response.');
    }
    return output;
  } catch (e: any) {
    console.error('Error in travelAi function:', e);
    throw new Error(`An error occurred: ${e.message}`);
  }
}

// New Recommender Flow
const RecommendCountryInputSchema = z.object({
  budget: z.string().optional(),
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
  language: z.string().default('az'),
  countryList: z.array(z.string()),
});

const RecommendCountryOutputSchema = z.object({
  country: z.string().describe("The name of the single best recommended country."),
  reason: z.string().describe("A brief, 2-3 sentence explanation for why this country was recommended based on the user's preferences. The response must be in the user's specified language."),
});

export type RecommendCountryInput = z.infer<typeof RecommendCountryInputSchema>;
export type RecommendCountryOutput = z.infer<typeof RecommendCountryOutputSchema>;

const recommendCountryPrompt = ai.definePrompt({
  name: 'recommendCountryPrompt',
  input: { schema: RecommendCountryInputSchema },
  output: { schema: RecommendCountryOutputSchema },
  prompt: `You are an expert travel recommender. Your task is to recommend ONE single country from the provided list based on the user's preferences.

Your response MUST be in the language specified by the user's language code ({{language}}).

User Preferences:
- Budget: {{#if budget}}{{budget}}{{else}}Not specified{{/if}}
- Travel Style: {{#if travelStyle}}{{travelStyle}}{{else}}Not specified{{/if}}
- Interests: {{#if interests}}{{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}

Available Countries (You MUST choose one from this list):
{{#each countryList}}
- {{{this}}}
{{/each}}

Based on these preferences, analyze the available countries and select the single best fit. Provide the country's name and a short (2-3 sentences) justification for your choice in the user's language.
`,
});

export async function recommendCountry(input: RecommendCountryInput): Promise<RecommendCountryOutput> {
  if (!input.countryList || input.countryList.length === 0) {
    throw new Error("Country list is empty.");
  }

  const { output } = await recommendCountryPrompt(input);
  if (!output) {
    throw new Error("AI failed to provide a recommendation.");
  }
  return output;
}
