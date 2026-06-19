
export const getUniqIdValue = (ids: string[]): string[] => {
  return [...new Set(ids)];
};
