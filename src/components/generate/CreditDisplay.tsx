interface CreditDisplayProps {
  credits: number | null;
  modelCost: number | null;
}

export function CreditDisplay({ credits, modelCost }: CreditDisplayProps) {
  return (
    <div className="text-sm">
      Credits: <span className="font-semibold">{credits ?? '...'}</span>
      {modelCost !== null && (
        <span className="text-muted-foreground ml-2">
          {modelCost === 0 ? "Free" : `Cost: ${modelCost} credits`}
        </span>
      )}
    </div>
  );
}