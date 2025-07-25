
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateVideo } from '@/ai/flows/video-generation-flow';
import { Loader } from 'lucide-react';

export default function VideoGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateVideo = async () => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a prompt to generate a video.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedVideo(null);

    try {
      const result = await generateVideo({ prompt });
      setGeneratedVideo(result.video);
      toast({
        title: 'Video Generated',
        description: 'Your video has been successfully generated.',
      });
    } catch (error) {
      console.error('Video generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Video Generation Failed',
        description:
          'Could not generate the video. Please check the console for more details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Video Generation</h1>
        <p className="text-muted-foreground">
          Create stunning videos from text prompts using AI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate a New Video</CardTitle>
          <CardDescription>
            Describe the video you want to create. Be as descriptive as
            possible for the best results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-prompt">Prompt</Label>
            <Textarea
              id="video-prompt"
              placeholder="e.g., A majestic dragon soaring over a mystical forest at dawn."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateVideo} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Video'
            )}
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Your Video...</CardTitle>
            <CardDescription>
              This may take a few moments. Please be patient.
            </CardDescription>
          </Header>
          <CardContent className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-4">
              <Loader className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                The AI is hard at work creating your masterpiece.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedVideo && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
            <CardDescription>
              Here is the video created from your prompt.
            </CardDescription>
          </Header>
          <CardContent>
            <video
              src={generatedVideo}
              controls
              className="aspect-video w-full rounded-lg border"
            >
              Your browser does not support the video tag.
            </video>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
