type Version = {
  version: string;
  draft: boolean;
  prerelease: boolean;
};

type DatabaseVersion = {
  draft: boolean;
  prerelease: boolean;
  modules: string[];
};
type Database = { [version: string]: DatabaseVersion };

type RegistryGithubModule = {
  versioned: boolean;
  versions: string[];
  drafts: string[];
  prereleases: string[];
  latest: string;
};
type RegistryModule = RegistryGithubModule;
type Registry = { [module: string]: RegistryModule };

export { Database, DatabaseVersion, Registry, Version };
