interface DevelopmentInfoProps {
  isPregnancy: boolean;
  pregnancyWeek?: number;
  babyAge?: { months: number; weeks: number; days: number };
}

const pregnancyData: Record<number, { size: string; length: string; weight: string; facts: string[] }> = {
  8: { size: 'Raspberry', length: '1.6cm', weight: '1g', facts: ['Fingers forming', 'Heart beating visibly'] },
  9: { size: 'Cherry', length: '2.3cm', weight: '2g', facts: ['Toes developing', 'Basic facial features'] },
  10: { size: 'Strawberry', length: '3.1cm', weight: '4g', facts: ['Vital organs functioning', 'Bones forming'] },
  11: { size: 'Lime', length: '4.1cm', weight: '7g', facts: ['Baby can stretch and yawn'] },
  12: { size: 'Plum', length: '5.4cm', weight: '14g', facts: ['Reflexes developing', 'Organs fully formed'] },
  16: { size: 'Avocado', length: '11.6cm', weight: '100g', facts: ['Can hear sounds', 'Grows hair'] },
  20: { size: 'Banana', length: '16.4cm', weight: '300g', facts: ['Can feel movement', 'Develops sleep patterns'] },
  24: { size: 'Corn', length: '30cm', weight: '600g', facts: ['Lungs developing', 'Brain growing rapidly'] },
  28: { size: 'Cauliflower', length: '37.6cm', weight: '1kg', facts: ['Eyes can open', 'Can recognize voices'] },
  32: { size: 'Squash', length: '42.4cm', weight: '1.7kg', facts: ['Practicing breathing', 'Bones hardening'] },
  36: { size: 'Lettuce', length: '47.4cm', weight: '2.6kg', facts: ['Preparing for birth', 'Fully developed'] },
  40: { size: 'Watermelon', length: '51.2cm', weight: '3.4kg', facts: ['Ready to be born!'] },
};

const babyData: Record<number, { length: string; weight: string; facts: string[] }> = {
  0: { length: '50cm', weight: '3.4kg', facts: ['Can recognize parent\'s voice', 'Sleeps 16-17 hours/day'] },
  1: { length: '54cm', weight: '4.2kg', facts: ['Focuses on faces', 'First social smile'] },
  2: { length: '57cm', weight: '5.2kg', facts: ['Holds head up briefly', 'Coos and gurgles'] },
  3: { length: '60cm', weight: '6kg', facts: ['Reaches for objects', 'Laughs out loud'] },
  4: { length: '63cm', weight: '6.7kg', facts: ['Rolls over', 'Supports head steadily'] },
  6: { length: '65cm', weight: '7.3kg', facts: ['May start solid foods', 'Sits with support'] },
  9: { length: '72cm', weight: '8.6kg', facts: ['Crawls or scoots', 'Understands "no"'] },
  12: { length: '76cm', weight: '9.6kg', facts: ['May take first steps', 'Says first words'] },
  18: { length: '82cm', weight: '11kg', facts: ['Walks confidently', 'Uses 10-20 words'] },
  24: { length: '87cm', weight: '12.5kg', facts: ['Runs and jumps', 'Forms short sentences'] },
};

export const DevelopmentInfo = ({ isPregnancy, pregnancyWeek, babyAge }: DevelopmentInfoProps) => {
  const getClosestData = (): { size?: string; length: string; weight: string; facts: string[] } | null => {
    if (isPregnancy && pregnancyWeek) {
      const weeks = [8, 9, 10, 11, 12, 16, 20, 24, 28, 32, 36, 40];
      const closest = weeks.reduce((prev, curr) => 
        Math.abs(curr - pregnancyWeek) < Math.abs(prev - pregnancyWeek) ? curr : prev
      );
      return pregnancyData[closest];
    } else if (babyAge) {
      const months = [0, 1, 2, 3, 4, 6, 9, 12, 18, 24];
      const closest = months.reduce((prev, curr) => 
        Math.abs(curr - babyAge.months) < Math.abs(prev - babyAge.months) ? curr : prev
      );
      return babyData[closest];
    }
    return null;
  };

  const data = getClosestData();

  if (!data) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
        <div className="space-y-1">
          {isPregnancy && 'size' in data && (
            <p className="text-sm font-medium text-foreground">Size: {data.size}</p>
          )}
          <p className="text-xs text-muted-foreground">Length: {data.length}</p>
          <p className="text-xs text-muted-foreground">Weight: {data.weight}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Developmental Milestones</h4>
        <ul className="space-y-1">
          {data.facts.map((fact: string, index: number) => (
            <li key={index} className="text-xs text-muted-foreground flex items-start">
              <span className="text-primary mr-2">•</span>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
