enum DatabaseModuleType {
  Github = 'github',
  Esm = 'esm',
  Url = 'url',
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

type Dependencies = { [module: string]: string };

enum RegistryModuleType {
  Github = 'github',
  Npm = 'npm',
}
type RegistryModuleAlias = { [alias: string]: string };
type RegistryGithubVersion = {
  versions: string[];
  drafts: string[];
  prereleases: string[];
  deprecateds: string[];
};
type RegistryNpmVersion = { versions: string[]; deprecateds: string[] };
type RegistryGithubModule = {
  type: RegistryModuleType.Github;
  owner: string;
  repo: string;
  path: string;
  alias: RegistryModuleAlias;
} & RegistryGithubVersion;
type RegistryNpmModule = {
  type: RegistryModuleType.Npm;
  url: string;
  npm: string;
  alias: RegistryModuleAlias;
} & RegistryNpmVersion;
type RegistryModule = RegistryGithubModule | RegistryNpmModule;
type Registry = { [module: string]: RegistryModule };

export {
  Database,
  DatabaseModuleType,
  Dependencies,
  Registry,
  RegistryGithubVersion,
  RegistryModule,
  RegistryModuleType,
  RegistryNpmVersion,
};
