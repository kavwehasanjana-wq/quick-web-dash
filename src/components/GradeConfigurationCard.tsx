import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save } from 'lucide-react';

export interface GradeRange {
  grade: string;
  minScore: number;
  maxScore: number;
}

interface GradeConfigurationCardProps {
  gradeRanges: GradeRange[];
  onGradeRangesChange: (ranges: GradeRange[]) => void;
  onReset: () => void;
  onSave: () => void;
}

const GradeConfigurationCard: React.FC<GradeConfigurationCardProps> = ({
  gradeRanges,
  onGradeRangesChange,
  onReset,
  onSave
}) => {
  const ALLOWED_GRADES = ['A', 'B', 'C', 'S', 'F'];
  
  const handleRangeChange = (index: number, field: keyof GradeRange, value: string | number) => {
    // Validate grade input
    if (field === 'grade') {
      const gradeValue = String(value).toUpperCase();
      if (gradeValue && !ALLOWED_GRADES.includes(gradeValue)) {
        return; // Don't update if not an allowed grade
      }
      value = gradeValue;
    }
    
    const updatedRanges = [...gradeRanges];
    updatedRanges[index] = {
      ...updatedRanges[index],
      [field]: field === 'grade' ? value : Number(value)
    };
    onGradeRangesChange(updatedRanges);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Grade Configuration</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradeRanges.map((range, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div>
                <Label htmlFor={`grade-${index}`}>Grade</Label>
                <Input
                  id={`grade-${index}`}
                  value={range.grade}
                  onChange={(e) => handleRangeChange(index, 'grade', e.target.value)}
                  className="font-bold text-center"
                  maxLength={1}
                  placeholder="A/B/C/S/F"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`min-${index}`}>Min Score</Label>
                  <Input
                    id={`min-${index}`}
                    type="number"
                    value={range.minScore}
                    onChange={(e) => handleRangeChange(index, 'minScore', e.target.value)}
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <Label htmlFor={`max-${index}`}>Max Score</Label>
                  <Input
                    id={`max-${index}`}
                    type="number"
                    value={range.maxScore}
                    onChange={(e) => handleRangeChange(index, 'maxScore', e.target.value)}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeConfigurationCard;
