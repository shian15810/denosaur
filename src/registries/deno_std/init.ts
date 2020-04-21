import LinkHeader from "pika:http-link-header";
import * as semver from "pika:semver";

import * as types from "./types.ts";
import * as wretch from "../../wretch.ts";

const getJson = (): Promise<types.Database> =>
  wretch.githubRaw
    .url("/shian15810/denosaur/master/src/registries/deno_std/database.json")
    .get()
    .json();

const getExist = (): Promise<boolean> =>
  wretch.githubCom
    .url("/denoland/deno")
    .head()
    .notFound(() => false)
    .res(() => true);

const getLatest = async (): Promise<string | undefined> => {
  type Latest = { tag_name: string } | undefined;

  const latest: Latest = await wretch.githubApi
    .url("/repos/denoland/deno/releases/latest")
    .get()
    .notFound(() => undefined)
    .json();
  if (latest === undefined) return undefined;
  return semver.valid(latest.tag_name) ?? undefined;
};

const getVersions = (): Promise<types.Version[]> => {
  const getReleases = async (
    url: string,
    replace: boolean,
    versions: types.Version[],
  ): Promise<types.Version[]> => {
    type Releases = { tag_name: string; draft: boolean; prerelease: boolean }[];

    const response = await wretch.githubApi.url(url, replace).get().res();
    const releases: Releases = await response.json();
    const vers = releases.reduce((vs, { tag_name: tag, draft, prerelease }) => {
      const version = semver.valid(tag);
      if (version === null) return vs;
      return [
        ...vs,
        {
          version,
          latest: false,
          draft,
          prerelease,
          deprecated: semver.lt(version, "0.21.0"),
        },
      ];
    }, versions);
    const link = response.headers.get("Link");
    if (link === null) return vers;
    const uri = LinkHeader.parse(link).rel("next")[0]?.uri;
    if (uri === undefined) return vers;
    return getReleases(uri, true, vers);
  };

  const url = "/repos/denoland/deno/releases?per_page=100";
  return getReleases(url, false, []);
};

const getDatabase = async (
  versions: types.Version[],
): Promise<types.Database> => {
  const getContents = async ({
    version,
    ...entry
  }: types.Version): Promise<[string, types.DatabaseVersion]> => {
    type Contents = { entries?: { type: string; name: string }[] } | undefined;

    const contents: Contents = await wretch.githubApi
      .url(
        entry.deprecated
          ? "/repos/denoland/deno_std/contents"
          : "/repos/denoland/deno/contents/std",
      )
      .query({ ref: `v${version}` })
      .accept("application/vnd.github.object")
      .get()
      .notFound(() => undefined)
      .json();
    const modules = contents?.entries?.reduce(
      (mods: string[], { type, name: mod }) =>
        type === "dir" && !mod.startsWith(".") ? [...mods, mod] : mods,
      [],
    ) ?? [];
    return [version, { ...entry, modules }];
  };

  const entries = await Promise.all(versions.map(getContents));
  return Object.fromEntries(entries);
};

const mergeDatabases = (
  databaseA: types.Database,
  databaseB: types.Database,
  latest: string,
): types.Database =>
  Object.entries({ ...databaseA, ...databaseB }).reduce(
    (database: types.Database, [version, entry]) => ({
      ...database,
      [version]: { ...entry, latest: version === latest },
    }),
    {},
  );

const toRegistry = (database: types.Database): types.Registry =>
  Object.entries(database).reduce(
    (
      registry: types.Registry,
      [version, { latest, draft, prerelease, deprecated, modules }],
    ) =>
      modules.reduce(
        (reg, mod) => ({
          ...reg,
          [mod]: {
            cached: false,
            type: reg[mod]?.type ?? types.RegistryModuleType.Github,
            owner: "denoland",
            repo: deprecated ? "deno_std" : "deno",
            path: deprecated ? "" : "std",
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

const toDependencies = (
  registry: types.Registry,
  dependencies: types.Dependencies,
): types.Dependencies => {
  const modules = Object.keys(dependencies);
  return Object.keys(registry).reduce(
    (deps: types.Dependencies, mod) =>
      modules.includes(mod) && semver.validRange(dependencies[mod]) !== null
        ? { ...deps, [mod]: dependencies[mod] }
        : deps,
    {},
  );
};

const cacheRegistry = (
  registry: types.Registry,
  modules: string[],
): types.Registry =>
  Object.entries(registry).reduce(
    (reg: types.Registry, [mod, ent]) =>
      modules.includes(mod) && !ent.cached
        ? { ...reg, [mod]: { ...ent, cached: true } }
        : reg,
    {},
  );

export {
  cacheRegistry,
  getDatabase,
  getExist,
  getJson,
  getLatest,
  getVersions,
  mergeDatabases,
  toDependencies,
  toRegistry,
};
