'use server';

/**
 * @fileOverview Highlights payment clauses based on customer payment history.
 *
 * - highlightPaymentClauses - A function that takes customer payment history and returns highlighted payment clauses.
 * - HighlightPaymentClausesInput - The input type for the highlightPaymentClauses function.
 * - HighlightPaymentClausesOutput - The return type for the highlightPaymentClauses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HighlightPaymentClausesInputSchema = z.object({
  paymentHistory: z
    .string()
    .describe('A summary of the customer payment history.'),
  paymentPolicy: z
    .string()
    .describe('The company standard payment policy.'),
});
export type HighlightPaymentClausesInput = z.infer<typeof HighlightPaymentClausesInputSchema>;

const HighlightPaymentClausesOutputSchema = z.object({
  highlightedClauses: z
    .string()
    .describe('The payment policy with highlighted clauses based on payment history.'),
});
export type HighlightPaymentClausesOutput = z.infer<typeof HighlightPaymentClausesOutputSchema>;

export async function highlightPaymentClauses(input: HighlightPaymentClausesInput): Promise<HighlightPaymentClausesOutput> {
  return highlightPaymentClausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'highlightPaymentClausesPrompt',
  input: {schema: HighlightPaymentClausesInputSchema},
  output: {schema: HighlightPaymentClausesOutputSchema},
  prompt: `You are an expert at adjusting payment policies based on customer payment history.

  Based on the customer's payment history, highlight the relevant clauses in the company's payment policy.
  New customers should receive favorable payment terms, while delinquent customers should see stringent payment clauses.

  Payment History: {{{paymentHistory}}}
  Payment Policy: {{{paymentPolicy}}}

  Return the payment policy with the relevant clauses highlighted using markdown. Clauses that apply should be enclosed in **bold** markdown.
  `,
});

const highlightPaymentClausesFlow = ai.defineFlow(
  {
    name: 'highlightPaymentClausesFlow',
    inputSchema: HighlightPaymentClausesInputSchema,
    outputSchema: HighlightPaymentClausesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
