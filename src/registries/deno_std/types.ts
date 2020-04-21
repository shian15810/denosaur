type Version = {
  version: string;
  latest: boolean;
  draft: boolean;
  prerelease: boolean;
  deprecated: boolean;
};

type DatabaseVersion = {
  latest: boolean;
  draft: boolean;
  prerelease: boolean;
  deprecated: boolean;
  modules: string[];
};
type Database = { [version: string]: DatabaseVersion };

enum RegistryModuleType {
  Github = "github",
}
type RegistryModuleReference = { [reference: string]: string };
type RegistryModule = {
  type: RegistryModuleType.Github;
  owner: string;
  repo: string;
  path: string;
  reference: RegistryModuleReference;
  versions: string[];
  drafts: string[];
  prereleases: string[];
  deprecateds: string[];
};
type Registry = { [module: string]: RegistryModule };

type Dependencies = { [module: string]: string };

export {
  Database,
  DatabaseVersion,
  Dependencies,
  Registry,
  RegistryModuleType,
  Version,
};
