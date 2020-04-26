interface Vendor {
  resolve: (module: string, rangeOrAlias: string) => string;
}

export { Vendor };
