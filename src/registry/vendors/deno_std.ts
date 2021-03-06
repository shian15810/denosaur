import { ResolvedVersion, Vendor } from "../types.ts";

class DenoStd implements Vendor {
  init = (): Promise<void> => Promise.resolve();

  resolveVersion = (
    module: string,
    rangeOrAlias: string,
  ): Promise<ResolvedVersion | undefined> =>
    Promise.resolve({ version: rangeOrAlias, isDeprecated: false });
}

export default DenoStd;
