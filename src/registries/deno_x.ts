enum DatabaseModuleType {
  Github = "github",
  Esm = "esm",
  Url = "url",
}
type DatabaseModuleBase = {
  type: DatabaseModuleType;
  owner?: string;
  repo?: string;
  url?: string;
  desc?: string;
};
type DatabaseGithubModule = DatabaseModuleBase & {
  type: DatabaseModuleType.Github;
  owner: string;
  repo: string;
};
type DatabaseEsmModule = DatabaseModuleBase & {
  type: DatabaseModuleType.Esm;
  url: string;
};
type DatabaseUrlModule = DatabaseModuleBase & {
  type: DatabaseModuleType.Url;
  url: string;
};
type DatabaseModule =
  | DatabaseGithubModule
  | DatabaseEsmModule
  | DatabaseUrlModule;

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

type Database = { [module: string]: DatabaseModule };
type Registry = { [module: string]: RegistryModule };

const getDatabase = async (): Promise<Database> => {
  const url =
    "https://raw.githubusercontent.com/denoland/deno_website2/master/src/database.json";
  const response = await fetch(url);
  if (!response.ok) throw response;
  return response.json();
};

const toRegistry = (database: Database): Registry =>
  Object.entries(database)
    .map(([module, entry]): [string, DatabaseModule] => {
      if (entry.type === DatabaseModuleType.Github) return [module, entry];
      const { hostname, pathname } = new URL(entry.url);
      if (hostname !== "github.com") return [module, entry];
      const [, owner, repo] = pathname.split("/");
      return [
        module,
        { ...entry, type: DatabaseModuleType.Github, owner, repo },
      ];
    })
    .reduce((registry: Registry, [module, entry]) => {
      if (entry.type === DatabaseModuleType.Github) {
        return {
          ...registry,
          [module]: {
            cached: false,
            type: RegistryModuleType.Github,
            owner: entry.owner,
            repo: entry.repo,
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
