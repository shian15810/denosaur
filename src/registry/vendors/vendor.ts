interface Vendor {
  init: () => Promise<void>;

  resolve: (module: string, rangeOrAlias: string) => string;
}

export default Vendor;
