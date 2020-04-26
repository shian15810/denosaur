import Vendor from "./vendor.ts";

class DenoStd implements Vendor {
  init = (): Promise<void> => Promise.resolve();

  resolve = (module: string, rangeOrAlias: string): string => rangeOrAlias;
}

export default DenoStd;
