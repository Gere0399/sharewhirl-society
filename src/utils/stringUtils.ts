export const getInitials = (username: string) => {
  return username.slice(0, 2).toUpperCase();
};