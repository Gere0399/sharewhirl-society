import { formatDistanceToNowStrict, format, differenceInDays } from "date-fns";

export const formatTimeAgo = (date?: string) => {
  if (!date) return "";
  
  try {
    const postDate = new Date(date);
    
    // Validate the date
    if (isNaN(postDate.getTime())) {
      console.error("Invalid date:", date);
      return "";
    }

    const now = new Date();
    const diffInDays = differenceInDays(now, postDate);
    
    // For posts from today (0 days difference), show hours/minutes ago
    if (diffInDays === 0) {
      return formatDistanceToNowStrict(postDate, {
        addSuffix: true,
        roundingMethod: 'floor'
      });
    }
    
    // For yesterday
    if (diffInDays === 1) {
      return "yesterday";
    }
    
    // For recent days (up to 7 days)
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }
    
    // For older posts, show the date
    return format(postDate, 'MMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};