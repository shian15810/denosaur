import { Vendor } from "./types.ts";

class Unpkg implements Vendor {
  resolve = (module: string, rangeOrAlias: string): string => "";
}

export default Unpkg;
