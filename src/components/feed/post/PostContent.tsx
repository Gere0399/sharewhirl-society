interface PostContentProps {
  title: string;
  content: string;
  tags?: string[];
}

export function PostContent({ title, content }: PostContentProps) {
  return (
    <div>
      <h3 className="text-lg font-normal mb-2">{title}</h3>
    </div>
  );
}