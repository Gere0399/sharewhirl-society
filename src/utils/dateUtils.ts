import { formatDistanceToNowStrict } from "date-fns";

export const formatTimeAgo = (date?: string) => {
  if (!date) return "";
  
  try {
    const postDate = new Date(date);
    
    // Validate the date
    if (isNaN(postDate.getTime())) {
      console.error("Invalid date:", date);
      return "";
    }
    
    // For very recent posts (less than a minute ago)
    const diffInSeconds = Math.floor((Date.now() - postDate.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return "just now";
    }
    
    // Get the formatted distance
    const timeAgo = formatDistanceToNowStrict(postDate, {
      addSuffix: false,
      roundingMethod: 'floor'
    });
    
    // Add "ago" suffix
    return `${timeAgo} ago`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};