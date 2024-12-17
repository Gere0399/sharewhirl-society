import { formatDistanceToNowStrict, format } from "date-fns";

export const formatTimeAgo = (date?: string) => {
  if (!date) return "";
  
  try {
    const postDate = new Date(date);
    
    // Validate the date
    if (isNaN(postDate.getTime())) {
      console.error("Invalid date:", date);
      return "";
    }
    
    // Calculate time difference in days
    const diffInDays = Math.floor((Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // For posts older than 7 days, show the actual date
    if (diffInDays > 7) {
      return format(postDate, 'MMM d, yyyy');
    }
    
    // For very recent posts (less than a minute ago)
    const diffInSeconds = Math.floor((Date.now() - postDate.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return "just now";
    }
    
    // Get the formatted distance for recent posts
    const timeAgo = formatDistanceToNowStrict(postDate, {
      addSuffix: false,
      roundingMethod: 'floor'
    });
    
    return `${timeAgo} ago`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};