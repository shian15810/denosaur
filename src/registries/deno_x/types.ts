enum DatabaseModuleType {
  Github = "github",
  Esm = "esm",
  Url = "url",
}
type DatabaseGithubModule = {
  type: DatabaseModuleType.Github;
  owner: string;
  repo: string;
  path?: string;
};
type DatabaseEsmModule = { type: DatabaseModuleType.Esm; url: string };
type DatabaseUrlModule = { type: DatabaseModuleType.Url; url: string };
type DatabaseModule =
  | DatabaseGithubModule
  | DatabaseEsmModule
  | DatabaseUrlModule;
type Database = { [module: string]: DatabaseModule };

enum RegistryModuleType {
  Github = "github",
  Npm = "npm",
}
type RegistryModuleAlias = { [alias: string]: string };
type RegistryGithubModule = {
  type: RegistryModuleType.Github;
  owner: string;
  repo: string;
  path: string;
  versions: string[];
  drafts: string[];
  prereleases: string[];
  alias: RegistryModuleAlias;
};
type RegistryNpmModule = {
  type: RegistryModuleType.Npm;
  url: string;
  name: string;
  versions: string[];
  deprecateds: string[];
  alias: RegistryModuleAlias;
};
type RegistryModule = RegistryGithubModule | RegistryNpmModule;
type Registry = { [module: string]: RegistryModule };

export { Database, DatabaseModuleType, Registry, RegistryModuleType };
