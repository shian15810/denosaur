type Module = {
  desc?: string;
  owner?: string;
  repo?: string;
  type: "esm" | "github" | "url";
  url?: string;
};

type EsmModule = Module & { type: "esm"; url: string };
type GithubModule = Module & { owner: string; repo: string; type: "github" };
type UrlModule = Module & { type: "url"; url: string };

type Database = { [module: string]: EsmModule | GithubModule | UrlModule };
type Registry = { [module: string]: string[] };

const getDatabase = async (): Promise<Database> => {
  const url =
    "https://raw.githubusercontent.com/denoland/deno_website2/master/src/database.json";
  const response = await fetch(url);
  if (!response.ok) throw response;
  return response.json();
};

const toRegistry = (database: Database): Registry =>
  Object.keys(database).reduce(
    (registry, module) => ({ ...registry, [module]: [] }),
    {},
  );

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
