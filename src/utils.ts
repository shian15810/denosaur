const isNotUndefined = <T>(arg: T | undefined): arg is T => arg !== undefined;

const isUndefined = <T>(arg: T | undefined): arg is undefined =>
  arg === undefined;

const unique = <T>(arg: T[]): T[] => [...new Set(arg)];

export { isNotUndefined, isUndefined, unique };
