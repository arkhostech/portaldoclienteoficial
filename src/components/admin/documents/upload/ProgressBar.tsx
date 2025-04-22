
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="space-y-2 my-4">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Enviando documentos...</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-3 bg-secondary" />
    </div>
  );
};
