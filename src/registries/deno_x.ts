import * as wretch from "../wretch.ts";

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
type RegistryModuleReference = { [reference: string]: string };
type RegistryGithubModule = {
  cached: boolean;
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
type RegistryNpmModule = {
  cached: boolean;
  type: RegistryModuleType.Npm;
  url: string;
  reference: RegistryModuleReference;
  versions: string[];
  deprecateds: string[];
};
type RegistryModule = RegistryGithubModule | RegistryNpmModule;
type Registry = { [module: string]: RegistryModule };

const getDatabase = (): Promise<Database> =>
  wretch.githubRaw
    .url("/denoland/deno_website2/master/src/database.json")
    .get()
    .json();

const toRegistry = (database: Database): Registry =>
  Object.entries(database).reduce((registry: Registry, [module, entry]) => {
    if (entry.type === DatabaseModuleType.Github) {
      return {
        ...registry,
        [module]: {
          cached: false,
          type: RegistryModuleType.Github,
          owner: entry.owner,
          repo: entry.repo,
          path: entry.path ?? "",
          reference: {},
          versions: [],
          drafts: [],
          prereleases: [],
          deprecateds: [],
        },
      };
    }

    const { hostname } = new URL(entry.url);
    if (["cdn.pika.dev", "unpkg.com"].includes(hostname)) {
      return {
        ...registry,
        [module]: {
          cached: false,
          type: RegistryModuleType.Npm,
          url: entry.url.replace("${b}", "%s").replace("${v}", "%s"),
          reference: {},
          versions: [],
          deprecateds: [],
        },
      };
    }

    return registry;
  }, {});

class DenoX {
  #database: Database = {};
  #registry: Registry = {};

  #inited = false;
  init = async (): Promise<this> => {
    if (this.#inited) return this;

    this.#database = await getDatabase();
    this.#registry = toRegistry(this.#database);
    this.#inited = true;
    return this;
  };
}

const denoX = (): Promise<DenoX> => new DenoX().init();

export default denoX;
