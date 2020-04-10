import LinkHeader from "pika:http-link-header";
import * as semver from "pika:semver";

import localDatabase from "../../public/deno_std.database.json";

type Database = { [module: string]: string[] };
type Registry = { [module: string]: string[] };

const { env } = Deno;

const { GITHUB_TOKEN } = env();

const getRequestInit = (): __domTypes.RequestInit | undefined =>
  typeof GITHUB_TOKEN === "string"
    ? { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    : undefined;

const getLatestVersion = async (): Promise<string | undefined> => {
  type Json = { tag_name: string };

  const url = "https://api.github.com/repos/denoland/deno/releases/latest";
  const response = await fetch(url, getRequestInit());
  if (!response.ok) throw response;
  const { tag_name: tag }: Json = await response.json();
  return semver.valid(tag) ?? undefined;
};

const getRemoteDatabase = async (): Promise<Database> => {
  const url =
    "https://raw.githubusercontent.com/shian15810/denosaur/master/public/deno_std.database.json";
  const response = await fetch(url);
  if (!response.ok) throw response;
  return response.json();
};

const getAllVersions = async (): Promise<string[]> => {
  const getVersions = async (
    url: string,
    versions: string[] = [],
  ): Promise<string[]> => {
    type Json = { draft: boolean; prerelease: boolean; tag_name: string }[];

    const response = await fetch(url, getRequestInit());
    if (!response.ok) throw response;
    const json: Json = await response.json();
    const vers = json.reduce((vs, { draft, prerelease, tag_name: tag }) => {
      if (draft || prerelease) return vs;
      const v = semver.valid(tag);
      if (v === null || semver.lt(v, "0.21.0")) return vs;
      return [...vs, v];
    }, versions);
    const link = response.headers.get("Link");
    if (link === null) return vers;
    const next = LinkHeader.parse(link).rel("next")[0]?.uri;
    if (next === undefined) return vers;
    return getVersions(next, vers);
  };

  const url =
    "https://api.github.com/repos/denoland/deno/releases?per_page=100";
  const versions = await getVersions(url);
  return [...new Set(versions)];
};

const getNewDatabase = async (versions: string[]): Promise<Database> => {
  const getEntry = async (version: string): Promise<[string, string[]]> => {
    type Json = { name: string; type: string }[];

    const url =
      `https://api.github.com/repos/denoland/deno/contents/std?ref=v${version}`;
    const response = await fetch(url, getRequestInit());
    if (!response.ok) throw response;
    const json: Json = await response.json();
    const modules = json.reduce(
      (mods: string[], { name: mod, type }) =>
        type === "dir" ? [...mods, mod] : mods,
      [],
    );
    return [version, modules];
  };

  const entries = await Promise.all(versions.map(getEntry));
  return Object.fromEntries(entries);
};

const toRegistry = (database: Database): Registry =>
  Object.entries(database).reduce(
    (registry: Registry, [version, modules]) =>
      modules.reduce(
        (reg, mod) => ({ ...reg, [mod]: [...(reg[mod] ?? []), version] }),
        registry,
      ),
    {},
  );

const sortDatabase = (database: Database): Database =>
  semver
    .rsort(Object.keys(database))
    .reduce(
      (db: Database, ver) => ({ ...db, [ver]: database[ver].sort() }),
      {},
    );

const sortRegistry = (registry: Registry): Registry =>
  Object.keys(registry)
    .sort()
    .reduce(
      (reg: Registry, mod) => ({ ...reg, [mod]: semver.rsort(registry[mod]) }),
      {},
    );

class DenoStd {
  #database: Database = localDatabase;
  #registry: Registry = {};

  #inited = false;
  init = async (): Promise<this> => {
    if (this.#inited) return this;

    const latestVersion = await getLatestVersion();

    if (
      latestVersion !== undefined &&
      this.#database[latestVersion] !== undefined
    ) {
      this.#database = sortDatabase(this.#database);
      this.#registry = toRegistry(this.#database);
      this.#registry = sortRegistry(this.#registry);
      this.#inited = true;
      return this;
    }

    const remoteDatabase = await getRemoteDatabase();
    this.#database = { ...this.#database, ...remoteDatabase };
    if (
      latestVersion !== undefined &&
      this.#database[latestVersion] !== undefined
    ) {
      this.#database = sortDatabase(this.#database);
      this.#registry = toRegistry(this.#database);
      this.#registry = sortRegistry(this.#registry);
      this.#inited = true;
      return this;
    }

    const oldVersions = Object.keys(this.#database);
    const allVersions = await getAllVersions();
    const newVersions = allVersions.filter(
      (version) => !oldVersions.includes(version),
    );

    const newDatabase = await getNewDatabase(newVersions);
    this.#database = { ...this.#database, ...newDatabase };
    this.#database = sortDatabase(this.#database);
    this.#registry = toRegistry(this.#database);
    this.#registry = sortRegistry(this.#registry);
    this.#inited = true;
    return this;
  };
}

const denoStd = (): Promise<DenoStd> => new DenoStd().init();

export default denoStd;
