/**
 * @param {string} key - string - the key to pluck from each object in the array
 * @param arr - any[]
 * @returns None
 */
export const pluck = (key: string, arr: any[]) => arr.map((v) => v[key]);
