import LinkHeader from "pika:http-link-header";
import * as semver from "pika:semver";

import localDatabase from "../../public/deno_std.database.json";

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
type Registry = { [module: string]: RegistryModule };

const { env } = Deno;

const { GITHUB_TOKEN } = env();

const getRequestInit = (): __domTypes.RequestInit | undefined =>
  GITHUB_TOKEN === undefined
    ? undefined
    : { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } };

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

const getAllVersions = (latest?: string): Promise<Version[]> => {
  const getVersions = async (
    url: string,
    versions: Version[] = [],
  ): Promise<Version[]> => {
    type Json = { tag_name: string; draft: boolean; prerelease: boolean }[];

    const response = await fetch(url, getRequestInit());
    if (!response.ok) throw response;
    const json: Json = await response.json();
    const vers = json.reduce((vs, { tag_name: tag, draft, prerelease }) => {
      const v = semver.valid(tag);
      if (v === null) return vs;
      return [
        ...vs,
        {
          version: v,
          latest: latest !== undefined && v === latest,
          draft,
          prerelease,
          deprecated: semver.lt(v, "0.21.0"),
        },
      ];
    }, versions);
    const link = response.headers.get("Link");
    if (link === null) return vers;
    const { uri } = LinkHeader.parse(link).rel("next")[0] ?? {};
    if (uri === undefined) return vers;
    return getVersions(uri, vers);
  };

  const url =
    "https://api.github.com/repos/denoland/deno/releases?per_page=100";
  return getVersions(url);
};

const getNewDatabase = async (versions: Version[]): Promise<Database> => {
  const getEntry = async ({
    version,
    ...entry
  }: Version): Promise<[string, DatabaseVersion]> => {
    type Json = { type: string; name: string }[];

    const url = entry.deprecated
      ? `https://api.github.com/repos/denoland/deno_std/contents?ref=v${version}`
      : `https://api.github.com/repos/denoland/deno/contents/std?ref=v${version}`;
    const response = await fetch(url, getRequestInit());
    if (!response.ok) {
      if (response.status !== 404) throw response;
      return [version, { ...entry, modules: [] }];
    }
    const json: Json = await response.json();
    const modules = json.reduce(
      (mods: string[], { type, name: mod }) =>
        type === "dir" && !mod.startsWith(".") ? [...mods, mod] : mods,
      [],
    );
    return [version, { ...entry, modules }];
  };

  const entries = await Promise.all(versions.map(getEntry));
  return Object.fromEntries(entries);
};

const toRegistry = (database: Database): Registry =>
  Object.entries(database).reduce(
    (
      registry: Registry,
      [version, { latest, draft, prerelease, deprecated, modules }],
    ) =>
      modules.reduce(
        (reg, mod) => ({
          ...reg,
          [mod]: {
            cached: reg[mod]?.cached ?? true,
            type: reg[mod]?.type ?? RegistryModuleType.Github,
            owner: "denoland",
            repo: "deno",
            reference: {
              ...(reg[mod]?.reference ?? {}),
              ...(latest ? { latest: version } : {}),
            },
            versions: [...(reg[mod]?.versions ?? []), version],
            drafts: [...(reg[mod]?.drafts ?? []), ...(draft ? [version] : [])],
            prereleases: [
              ...(reg[mod]?.prereleases ?? []),
              ...(prerelease ? [version] : []),
            ],
            deprecateds: [
              ...(reg[mod]?.deprecateds ?? []),
              ...(deprecated ? [version] : []),
            ],
          },
        }),
        registry,
      ),
    {},
  );

const sortDatabase = (database: Database): Database =>
  semver.rsort(Object.keys(database)).reduce(
    (db: Database, ver) => ({
      ...db,
      [ver]: { ...database[ver], modules: database[ver].modules.sort() },
    }),
    {},
  );

const sortRegistry = (registry: Registry): Registry =>
  Object.keys(registry)
    .sort()
    .reduce(
      (reg: Registry, mod) => ({
        ...reg,
        [mod]: {
          ...registry[mod],
          reference: Object.keys(registry[mod].reference)
            .sort()
            .reduce(
              (reference: RegistryModuleReference, ref) => ({
                ...reference,
                [ref]: registry[mod].reference[ref],
              }),
              {},
            ),
          versions: semver.rsort(registry[mod].versions),
          drafts: semver.rsort(registry[mod].drafts),
          prereleases: semver.rsort(registry[mod].prereleases),
          deprecateds: semver.rsort(registry[mod].deprecateds),
        },
      }),
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
      (this.#database[latestVersion]?.latest ?? false)
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
      (this.#database[latestVersion]?.latest ?? false)
    ) {
      this.#database = sortDatabase(this.#database);
      this.#registry = toRegistry(this.#database);
      this.#registry = sortRegistry(this.#registry);
      this.#inited = true;
      return this;
    }

    const allVersions = await getAllVersions(latestVersion);
    const newVersions = allVersions.filter(
      ({ version }) => this.#database[version] === undefined,
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
