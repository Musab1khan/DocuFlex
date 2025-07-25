'use server';

/**
 * @fileOverview An AI-powered semantic document search flow.
 *
 * - semanticDocumentSearch - A function that performs a semantic search over documents.
 * - SemanticDocumentSearchInput - The input type for the semanticDocumentSearch function.
 * - SemanticDocumentSearchOutput - The return type for the semanticDocumentSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SemanticDocumentSearchInputSchema = z.object({
  query: z.string().describe('The search query in natural language.'),
  documentContent: z.string().describe('The content of the document to search through.'),
});
export type SemanticDocumentSearchInput = z.infer<typeof SemanticDocumentSearchInputSchema>;

const SemanticDocumentSearchOutputSchema = z.object({
  relevantPassages: z
    .array(z.string())
    .describe('The passages from the document that are most relevant to the query.'),
  reasoning: z
    .string()
    .describe(
      'A explanation of how the document passages were selected to be relevant to the search query.'
    ),
});
export type SemanticDocumentSearchOutput = z.infer<typeof SemanticDocumentSearchOutputSchema>;

export async function semanticDocumentSearch(
  input: SemanticDocumentSearchInput
): Promise<SemanticDocumentSearchOutput> {
  return semanticDocumentSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'semanticDocumentSearchPrompt',
  input: {schema: SemanticDocumentSearchInputSchema},
  output: {schema: SemanticDocumentSearchOutputSchema},
  prompt: `You are a document search assistant. You will be given a search query and the content of a document.
Your task is to identify the passages from the document that are most relevant to the search query.

Search Query: {{{query}}}

Document Content: {{{documentContent}}}

Return the most relevant passages from the document. Also, provide a brief explanation of why those passages are relevant to the search query. Ensure the answer is easily understood by the user.

Consider applying stemming, or other logic, to get best results.
`,
});

const semanticDocumentSearchFlow = ai.defineFlow(
  {
    name: 'semanticDocumentSearchFlow',
    inputSchema: SemanticDocumentSearchInputSchema,
    outputSchema: SemanticDocumentSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
