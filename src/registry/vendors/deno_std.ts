import { Vendor } from "./types.ts";

class DenoStd implements Vendor {
  init = (): Promise<this> => Promise.resolve(this);

  resolve = (module: string, rangeOrAlias: string): string => rangeOrAlias;
}

export default DenoStd;
