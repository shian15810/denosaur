import LinkHeader from "pika:http-link-header";
import * as semver from "pika:semver";

import * as types from "../types.ts";
import * as wretch from "../../../wretch.ts";

type Version = {
  version: string;
  draft: boolean;
  prerelease: boolean;
  deprecated: boolean;
};

const getExists = (owner: string, repo: string): Promise<boolean> =>
  wretch.githubCom
    .url(`/${owner}/${repo}`)
    .head()
    .notFound(() => false)
    .res(() => true);

const getLatest = async (
  owner: string,
  repo: string,
): Promise<string | undefined> => {
  type Latest = { tag_name: string } | undefined;

  const latest: Latest = await wretch.githubApi
    .url(`/repos/${owner}/${repo}/releases/latest`)
    .get()
    .notFound(() => undefined)
    .json();
  if (latest === undefined) return undefined;
  return semver.valid(latest.tag_name) ?? undefined;
};

const getVersions = (owner: string, repo: string): Promise<Version[]> => {
  const getReleases = async (
    url: string,
    replace: boolean,
    versions: Version[],
  ): Promise<Version[]> => {
    type Releases = { tag_name: string; draft: boolean; prerelease: boolean }[];

    const response = await wretch.githubApi.url(url, replace).get().res();
    const releases: Releases = await response.json();
    const vers = releases.reduce((vs, { tag_name: tag, draft, prerelease }) => {
      const version = semver.valid(tag);
      if (version === null) return vs;
      return [...vs, { version, draft, prerelease, deprecated: false }];
    }, versions);
    const link = response.headers.get("Link");
    if (link === null) return vers;
    const uri = LinkHeader.parse(link).rel("next")[0]?.uri;
    if (uri === undefined) return vers;
    return getReleases(uri, true, vers);
  };

  const url = `/repos/${owner}/${repo}/releases?per_page=100`;
  return getReleases(url, false, []);
};

const getVersion = async (
  owner: string,
  repo: string,
): Promise<types.RegistryGithubVersion> => {
  const versions = await getVersions(owner, repo);
  return versions.reduce(
    (
      github: types.RegistryGithubVersion,
      { version, draft, prerelease, deprecated },
    ) => ({
      versions: [...github.versions, version],
      drafts: [...github.drafts, ...(draft ? [version] : [])],
      prereleases: [...github.prereleases, ...(prerelease ? [version] : [])],
      deprecateds: [...github.deprecateds, ...(deprecated ? [version] : [])],
    }),
    { versions: [], drafts: [], prereleases: [], deprecateds: [] },
  );
};

export { getExists, getLatest, getVersion };
