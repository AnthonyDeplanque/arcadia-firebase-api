export const uuid = (length: number = 16): string => {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  return Array.from({ length })
    .map(() => char[Math.floor(Math.random() * char.length)])
    .join("");
};
