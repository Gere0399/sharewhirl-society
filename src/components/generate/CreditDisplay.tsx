interface CreditDisplayProps {
  credits: number | null;
}

export function CreditDisplay({ credits }: CreditDisplayProps) {
  return (
    <div className="text-sm">
      Credits: <span className="font-semibold">{credits ?? '...'}</span>
    </div>
  );
}