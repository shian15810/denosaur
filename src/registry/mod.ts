import Vendors, { isVendor, Vendor } from "./vendors/mod.ts";
import { isNotUndefined, isUndefined } from "../utils.ts";

type ParsedDependency = { vendor: Vendor; module: string };
const parseDependency = (dependency: string): ParsedDependency | undefined => {
  const vendorAndModule = dependency.split(":");
  if (vendorAndModule.length !== 2 || vendorAndModule.includes("")) return;
  const [vendor, module] = vendorAndModule;
  if (!isVendor(vendor)) return;
  return { vendor, module };
};

class Registry {
  #vendors = new Vendors();

  init = async (dependencies: string[]): Promise<this> => {
    const vendors = dependencies
      .map(parseDependency)
      .filter(isNotUndefined)
      .map(({ vendor }) => vendor);
    await this.#vendors.init(vendors);
    return this;
  };

  resolve = (dependency: string, rangeOrAlias: string): string | undefined => {
    const parsedDependency = parseDependency(dependency);
    if (isUndefined(parsedDependency)) return;
    const { vendor, module } = parsedDependency;
    return this.#vendors[vendor].resolve(module, rangeOrAlias);
  };
}

const registry = (dependencies: string[]): Promise<Registry> =>
  new Registry().init(dependencies);

export default registry;
