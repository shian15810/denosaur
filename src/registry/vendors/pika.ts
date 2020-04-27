import { getNpmVercument } from "../npm.ts";
import { ResolvedVersion, Vendor } from "../types.ts";
import { maxSatisfying, validRange } from "../../semver.ts";
import { isUndefined } from "../../utils.ts";

class Pika implements Vendor {
  init = (): Promise<void> => Promise.resolve();

  resolveVersion = async (
    module: string,
    rangeOrAlias: string,
  ): Promise<ResolvedVersion | undefined> => {
    const npmVercument = await getNpmVercument(module);
    if (isUndefined(npmVercument)) return;
    const { versions, deprecateds, aliases } = npmVercument;
    const version = validRange(rangeOrAlias)
      ? maxSatisfying(versions, rangeOrAlias)
      : aliases[rangeOrAlias];
    if (isUndefined(version)) return;
    const isDeprecated = deprecateds.includes(version);
    return { version, isDeprecated };
  };
}

export default Pika;
