import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FetalModel } from './3D/FetalModel';
import { BabyModel } from './3D/BabyModel';
import { DevelopmentInfo } from './3D/DevelopmentInfo';
import { Skeleton } from '@/components/ui/skeleton';
import { Baby } from 'lucide-react';

interface BabyDevelopment3DProps {
  babyName: string;
  babyAge: { months: number; weeks: number; days: number };
  isPregnancy: boolean;
  pregnancyWeek?: number;
}

export const BabyDevelopment3D = ({
  babyName,
  babyAge,
  isPregnancy,
  pregnancyWeek,
}: BabyDevelopment3DProps) => {
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
      <CardContent>
        <div className="w-full h-[400px] bg-gradient-to-b from-primary/5 to-accent/5 rounded-lg overflow-hidden">
          <Suspense fallback={<Skeleton className="w-full h-full" />}>
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 3]} />
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                minDistance={2}
                maxDistance={5}
                maxPolarAngle={Math.PI / 2}
              />
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
              <directionalLight position={[-5, 3, -5]} intensity={0.4} />
              <Environment preset="sunset" />

              {isPregnancy && pregnancyWeek ? (
                <FetalModel week={pregnancyWeek} />
              ) : (
                <BabyModel ageMonths={babyAge.months} />
              )}
            </Canvas>
          </Suspense>
        </div>

        <DevelopmentInfo
          isPregnancy={isPregnancy}
          pregnancyWeek={pregnancyWeek}
          babyAge={babyAge}
        />

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Drag to rotate • Scroll to zoom
        </p>
      </CardContent>
    </Card>
  );
};
