import LinkHeader from "pika:http-link-header";
import * as semver from "pika:semver";

import * as types from "./types.ts";
import * as wretch from "../../wretch.ts";

type Version = {
  version: string;
  draft: boolean;
  prerelease: boolean;
};

const getExists = (owner: string, repo: string) =>
  wretch.githubCom
    .url(`/${owner}/${repo}`)
    .head()
    .notFound(() => false)
    .res(() => true);

const getGithubLatest = async (
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

const getGithubVersions = (owner: string, repo: string): Promise<Version[]> => {
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
      return [...vs, { version, draft, prerelease }];
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

const getGithubDefaultBranch = async (
  owner: string,
  repo: string,
): Promise<string> => {
  type Repository = { default_branch: string };
  const repository: Repository = await wretch.githubApi
    .url(`/repos/${owner}/${repo}`)
    .get()
    .json();
  return repository.default_branch;
};

const getGithubVersion = async (
  owner: string,
  repo: string,
): Promise<
    | {
      versions: string[];
      drafts: string[];
      prereleases: string[];
      alias: { [alias: string]: string };
    }
    | undefined
> => {
  const exists = getExists(owner, repo);
  if (!exists) return;
  const githubLatest = await getGithubLatest(owner, repo);
  const githubVersions = await getGithubVersions(owner, repo);
  const versions = githubVersions.map(({ version }) => version);
  const drafts = githubVersions
    .filter(({ draft }) => draft)
    .map(({ version }) => version);
  const prereleases = githubVersions
    .filter(({ prerelease }) => prerelease)
    .map(({ version }) => version);
  const latest = githubLatest !== undefined && versions.includes(githubLatest)
    ? githubLatest
    : semver.maxSatisfying(versions, "*") ??
      (await getGithubDefaultBranch(owner, repo));
  console.log(githubVersions);
  const alias = { latest };
  return { versions, drafts, prereleases, alias };
};

const getNpmVersion = async (name: string) => {
  type Npm =
    | {
      "dist-tags": { [alias: string]: string };
      versions: {
        [version: string]: { version: string; deprecated?: string };
      };
    }
    | undefined;
  const npm: Npm = await wretch.npmRegistry.url(`/${name}`).get().json();
  if (npm === undefined) return;
  const { 'dist-tags': alias, versions: npmVersions } = npm;
  const versions = Object.keys(npmVersions);
  const deprecateds = Object.values(npmVersions)
    .filter(({ deprecated }) => deprecated !== undefined)
    .map(({ version }) => version);
  return { versions, deprecateds, alias };
};

export { getGithubVersion, getNpmVersion };
