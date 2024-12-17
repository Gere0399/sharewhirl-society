import { formatDistanceToNowStrict, format, isToday, isYesterday, differenceInSeconds } from "date-fns";

export const formatTimeAgo = (date?: string) => {
  if (!date) return "";
  
  try {
    const postDate = new Date(date);
    
    // Validate the date
    if (isNaN(postDate.getTime())) {
      console.error("Invalid date:", date);
      return "";
    }

    const secondsAgo = differenceInSeconds(new Date(), postDate);
    
    // Less than a minute ago
    if (secondsAgo < 60) {
      return "just now";
    }
    
    // Today - show relative time
    if (isToday(postDate)) {
      return formatDistanceToNowStrict(postDate, {
        addSuffix: true,
        roundingMethod: 'floor'
      });
    }
    
    // Yesterday
    if (isYesterday(postDate)) {
      return "yesterday";
    }
    
    // Default to formatted date
    return format(postDate, 'MMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};