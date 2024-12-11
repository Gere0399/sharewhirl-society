import { formatDistanceToNowStrict } from "date-fns";

export const formatTimeAgo = (date?: string) => {
  if (!date) return "";
  
  try {
    const postDate = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return "just now";
    }
    
    // Use formatDistanceToNowStrict for consistent formatting
    const timeAgo = formatDistanceToNowStrict(postDate, {
      addSuffix: true,
      roundingMethod: 'floor'
    });
    
    return timeAgo;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};