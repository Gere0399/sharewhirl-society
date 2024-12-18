interface PostContentProps {
  title: string;
  content: string;
  tags?: string[];
}

export function PostContent({ title }: PostContentProps) {
  return (
    <div className="-mt-[29.6px] ml-[60px]">
      <h3 className="text-sm font-normal break-words">{title}</h3>
    </div>
  );
}