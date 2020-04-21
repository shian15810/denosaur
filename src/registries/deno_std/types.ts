type Version = {
  version: string;
  draft: boolean;
  prerelease: boolean;
  deprecated: boolean;
};

type DatabaseVersion = {
  draft: boolean;
  prerelease: boolean;
  deprecated: boolean;
  modules: string[];
};
type Database = { [version: string]: DatabaseVersion };

type Dependencies = { [module: string]: string };

enum RegistryModuleType {
  Github = "github",
}
type RegistryModuleAlias = { [alias: string]: string };
type RegistryModule = {
  type: RegistryModuleType.Github;
  owner: string;
  repo: string;
  path: string;
  alias: RegistryModuleAlias;
  versions: string[];
  drafts: string[];
  prereleases: string[];
  deprecateds: string[];
};
type Registry = { [module: string]: RegistryModule };

export {
  Database,
  DatabaseVersion,
  Dependencies,
  Registry,
  RegistryModuleType,
  Version,
};
