import vendors, { isVendorName, VendorName } from "./vendors/mod.ts";

type ParsedDependency = { vendor: VendorName; module: string };
const parseDependency = (dependency: string): ParsedDependency | undefined => {
  const vendorAndModule = dependency.split(":");
  if (vendorAndModule.length !== 2 || vendorAndModule.includes("")) return;
  const [vendor, module] = vendorAndModule;
  if (!isVendorName(vendor)) return;
  return { vendor, module };
};

class Registry {
  #vendors = vendors();

  resolve = (dependency: string, rangeOrAlias: string): string | undefined => {
    const parsedDependency = parseDependency(dependency);
    if (parsedDependency === undefined) return;
    const { vendor, module } = parsedDependency;
    return this.#vendors[vendor].resolve(module, rangeOrAlias);
  };
}

export default Registry;
