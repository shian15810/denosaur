import LinkHeader from "pika:http-link-header";
import * as semver from "pika:semver";

import * as types from "./types.ts";
import * as wretch from "../../wretch.ts";

const getDatabase = (): Promise<types.Database> =>
  wretch.githubRaw
    .url("/shian15810/denosaur/master/src/registries/deno_std/database.json")
    .get()
    .notFound(() => ({}))
    .json();

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
      return [...vs, { version, draft, prerelease }];
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

const getDatabaseFromVersions = async (versions: types.Version[]) => {
  const getContents = async ({
    version,
    ...entry
  }: types.Version): Promise<[string, types.DatabaseVersion]> => {
    type Contents = { entries?: { type: string; name: string }[] } | undefined;

    const contents: Contents = await wretch.githubApi
      .url(
        semver.lt(version, "0.21.0")
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

const toRegistry = (
  database: types.Database,
  latest?: string,
): types.Registry =>
  Object.entries(
    Object.entries(database).reduce(
      (registry: types.Registry, [version, { draft, prerelease, modules }]) =>
        modules.reduce(
          (reg, mod) => ({
            ...reg,
            [mod]: {
              versioned: reg[mod]?.versioned ?? true,
              versions: [...(reg[mod]?.versions ?? []), version],
              drafts: [
                ...(reg[mod]?.drafts ?? []),
                ...(draft ? [version] : []),
              ],
              prereleases: [
                ...(reg[mod]?.prereleases ?? []),
                ...(prerelease ? [version] : []),
              ],
              alias: { ...(reg[mod]?.alias ?? {}) },
            },
          }),
          registry,
        ),
      {},
    ),
  ).reduce(
    (registry: types.Registry, [module, entry]) => ({
      ...registry,
      [module]: {
        ...entry,
        alias: {
          ...entry.alias,
          latest: latest !== undefined && entry.versions.includes(latest)
            ? latest
            : semver.maxSatisfying(entry.versions, "*") ?? "master",
        },
      },
    }),
    {},
  );

export {
  getDatabase,
  getDatabaseFromVersions,
  getLatest,
  getVersions,
  toRegistry,
};
