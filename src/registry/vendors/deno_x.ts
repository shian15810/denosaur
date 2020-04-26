import Vendor from "./vendor.ts";

class DenoX implements Vendor {
  init = (): Promise<void> => Promise.resolve();

  resolve = (module: string, rangeOrAlias: string): string => rangeOrAlias;
}

export default DenoX;
