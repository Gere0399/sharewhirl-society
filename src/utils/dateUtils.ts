export const formatTimeAgo = (date?: string) => {
  if (!date) return "";
  
  try {
    const postDate = new Date(date);
    const now = new Date();
    
    // Validate the date
    if (isNaN(postDate.getTime())) {
      console.error("Invalid date:", date);
      return "";
    }

    // If the date is in the future, return "just now"
    if (postDate > now) {
      console.warn("Future date detected, defaulting to 'just now':", date);
      return "just now";
    }

    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Less than a minute
    if (diffMins < 1) {
      return "just now";
    }
    
    // Less than an hour
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    
    // Less than a day
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    
    // Yesterday
    if (diffDays === 1) {
      return "yesterday";
    }
    
    // Less than a week
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    
    // More than a week
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};