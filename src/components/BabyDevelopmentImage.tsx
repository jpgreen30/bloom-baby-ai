import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DevelopmentInfo } from './3D/DevelopmentInfo';
import { Skeleton } from '@/components/ui/skeleton';
import { Baby, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BabyDevelopmentImageProps {
  babyName: string;
  babyAge: { months: number; weeks: number; days: number };
  isPregnancy: boolean;
  pregnancyWeek?: number;
  babyId: string;
}

export const BabyDevelopmentImage = ({
  babyName,
  babyAge,
  isPregnancy,
  pregnancyWeek,
  babyId,
}: BabyDevelopmentImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-baby-image', {
        body: {
          isPregnancy,
          pregnancyWeek: isPregnancy ? pregnancyWeek : undefined,
          ageMonths: !isPregnancy ? babyAge.months : undefined,
          babyName,
          babyId,
          forceRegenerate: false,
        }
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        throw new Error('No image returned from generation');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please try again.');
      toast.error('Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateImage();
  }, [isPregnancy, pregnancyWeek, babyAge.months]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-primary" />
          Development Visualization
        </CardTitle>
        <CardDescription>
          {isPregnancy
            ? `Week ${pregnancyWeek} of pregnancy`
            : `${babyName} at ${babyAge.months} months`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full h-[400px] bg-gradient-to-b from-primary/5 to-accent/5 rounded-lg overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
              <div className="absolute text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Generating your personalized image...</p>
              </div>
            </div>
          )}
          
          {error && !loading && (
            <div className="text-center p-4">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={generateImage} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
          
          {imageUrl && !loading && (
            <img
              src={imageUrl}
              alt={isPregnancy ? `Week ${pregnancyWeek} pregnancy` : `${babyName} at ${babyAge.months} months`}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {imageUrl && !loading && (
          <Button 
            onClick={generateImage} 
            variant="outline" 
            className="w-full"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New Image
          </Button>
        )}

        <DevelopmentInfo
          isPregnancy={isPregnancy}
          pregnancyWeek={pregnancyWeek}
          babyAge={babyAge}
        />
      </CardContent>
    </Card>
  );
};