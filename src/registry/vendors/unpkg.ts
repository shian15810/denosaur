import Vendor from "./vendor.ts";

class Unpkg implements Vendor {
  init = (): Promise<void> => Promise.resolve();

  resolve = (module: string, rangeOrAlias: string): string => rangeOrAlias;
}

export default Unpkg;
