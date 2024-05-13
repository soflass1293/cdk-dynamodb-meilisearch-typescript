export const createId = (input: Record<string, any>) => {
  let id = "";
  Object.entries(input).forEach(([key, value]) => {
    id += `${key}-MK-${value}_MS_`;
  });
  return id.substring(0, id.length - 4);
};

export const sortKeys = (obj: Record<string, any>) => {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};
  sortedKeys.forEach((key) => {
    // @ts-ignore
    sortedObj[key] = obj[key];
  });
  return sortedObj;
};
