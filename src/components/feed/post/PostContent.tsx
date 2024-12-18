interface PostContentProps {
  title: string;
  content: string;
  tags?: string[];
}

export function PostContent({ title, content }: PostContentProps) {
  return (
    <div className="-mt-5">
      <h3 className="text-sm font-normal break-words">{title}</h3>
    </div>
  );
}