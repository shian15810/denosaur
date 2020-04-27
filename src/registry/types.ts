type ResolvedVersion = { version: string; isDeprecated: boolean };

interface Vendor {
  init: () => Promise<void>;

  resolveVersion: (
    module: string,
    rangeOrAlias: string,
  ) => Promise<ResolvedVersion | undefined>;
}

export { ResolvedVersion, Vendor };
