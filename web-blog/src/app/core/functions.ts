export function isNorOrEmpty(obj) {
    return !obj || !Object.keys(obj).some(x => obj[x] !== void 0);
  }