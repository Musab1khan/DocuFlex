'use server';
/**
 * @fileOverview A video generation AI flow.
 *
 * - generateVideo - A function that handles the video generation process.
 * - GenerateVideoInput - The input type for the generateVideo function.
 * - GenerateVideoOutput - The return type for the generateVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import type {MediaPart} from 'genkit';
import * as fs from 'fs';
import {Readable} from 'stream';

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('The text prompt for video generation.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  video: z.string().describe("The generated video as a data URI."),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

async function downloadVideo(video: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    // Add API key before fetching the video.
    const videoDownloadResponse = await fetch(
        `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
    );
    if (
        !videoDownloadResponse ||
        videoDownloadResponse.status !== 200 ||
        !videoDownloadResponse.body
    ) {
        throw new Error('Failed to fetch video');
    }

    const buffer = await videoDownloadResponse.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async (input) => {
    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: input.prompt,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const videoPart = operation.output?.message?.content.find(p => !!p.media);
    if (!videoPart) {
      throw new Error('Failed to find the generated video');
    }
    
    const videoBase64 = await downloadVideo(videoPart);

    return {
      video: `data:video/mp4;base64,${videoBase64}`,
    };
  }
);


export async function generateVideo(
  input: GenerateVideoInput
): Promise<GenerateVideoOutput> {
  return generateVideoFlow(input);
}
