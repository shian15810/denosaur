import { Vendor } from "./types.ts";

class DenoX implements Vendor {
  init = (): Promise<this> => Promise.resolve(this);

  resolve = (module: string, rangeOrAlias: string): string => rangeOrAlias;
}

export default DenoX;
