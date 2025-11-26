import { z } from 'zod';

export const TravelAiInputSchema = z.object({
  prompt: z.string().describe("The user's question or prompt."),
});

export type TravelAiInput = z.infer<typeof TravelAiInputSchema>;

export const TravelAiOutputSchema = z.object({
  response: z.string().describe("The AI assistant's generated response."),
});

export type TravelAiOutput = z.infer<typeof TravelAiOutputSchema>;
