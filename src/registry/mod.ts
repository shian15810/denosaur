import { ResolvedVersion } from "./types.ts";
import Vendors, { isVendorName, VendorName } from "./vendors/mod.ts";
import { isNotUndefined, isUndefined, unique } from "../utils.ts";

type ParsedDependency = { vendor: VendorName; module: string };
const parseDependency = (dependency: string): ParsedDependency | undefined => {
  const vendorAndModule = dependency.split(":");
  if (vendorAndModule.length !== 2 || vendorAndModule.includes("")) return;
  const [vendor, module] = vendorAndModule;
  if (!isVendorName(vendor)) return;
  return { vendor, module };
};

class Registry {
  #vendors = new Vendors();

  init = async (dependencies: string[]): Promise<this> => {
    const vendors = dependencies
      .map(parseDependency)
      .filter(isNotUndefined)
      .map(({ vendor }) => vendor);
    await Promise.all(
      unique(vendors).map((vendor) => this.#vendors[vendor].init()),
    );
    return this;
  };

  resolveVersion = async (
    dependency: string,
    rangeOrAlias: string,
  ): Promise<ResolvedVersion | undefined> => {
    const parsedDependency = parseDependency(dependency);
    if (isUndefined(parsedDependency)) return;
    const { vendor, module } = parsedDependency;
    const resolvedVersion = await this.#vendors[vendor].resolveVersion(
      module,
      rangeOrAlias,
    );
    return resolvedVersion;
  };
}

const registry = (dependencies: string[]): Promise<Registry> =>
  new Registry().init(dependencies);

export default registry;
