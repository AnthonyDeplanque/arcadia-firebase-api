export const checkRequiredFields = <T>(
  item: Partial<T>,
  requiredFields: string[]
) => {
  for (const field of requiredFields) {
    if (item[field as keyof T] === undefined) {
      return `${field} est manquant`;
    }
  }
  return null;
};
