export const toJson = (arr: string[]) => {
  return arr.reduce((obj, key) => (obj[key] = true, obj), {});
}
