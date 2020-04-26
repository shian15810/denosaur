import { Vendor } from "./types.ts";

class Unpkg implements Vendor {
  resolve = (module: string, rangeOrAlias: string): string => rangeOrAlias;
}

export default Unpkg;