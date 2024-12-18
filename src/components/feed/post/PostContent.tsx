interface PostContentProps {
  title: string;
  content: string;
  tags?: string[];
}

export function PostContent({ title, content }: PostContentProps) {
  return (
    <div className="-mt-1">
      <h3 className="text-base font-normal mb-2 break-words">{title}</h3>
    </div>
  );
}