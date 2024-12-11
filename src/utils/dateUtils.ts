import { formatDistanceToNowStrict, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

export const formatTimeAgo = (date?: string) => {
  if (!date) return "";
  
  try {
    const postDate = new Date(date);
    const now = new Date();
    
    const days = differenceInDays(now, postDate);
    const weeks = differenceInWeeks(now, postDate);
    const months = differenceInMonths(now, postDate);
    
    if (days < 1) {
      return formatDistanceToNowStrict(postDate, { addSuffix: true });
    } else if (days === 1) {
      return "1 day ago";
    } else if (days < 7) {
      return `${days} days ago`;
    } else if (weeks === 1) {
      return "1 week ago";
    } else if (weeks < 4) {
      return `${weeks} weeks ago`;
    } else if (months === 1) {
      return "1 month ago";
    } else {
      return `${months} months ago`;
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};