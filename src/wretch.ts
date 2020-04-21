import wretch, { Wretcher } from "pika:wretch";

import * as deno from "./deno.ts";

const getGithubApi = (token?: string): Wretcher => {
  const wretcher = wretch("https://api.github.com");
  if (token === undefined) return wretcher;
  return wretcher.auth(`Bearer ${token}`);
};

const getGithubCom = (): Wretcher => wretch("https://github.com");

const getGithubRaw = (): Wretcher =>
  wretch("https://raw.githubusercontent.com");

const getNpmRegistry = (): Wretcher => wretch("https://registry.npmjs.org");

const githubApi = getGithubApi(deno.env.GITHUB_TOKEN);

const githubCom = getGithubCom();

const githubRaw = getGithubRaw();

const npmRegistry = getNpmRegistry();

export { githubApi, githubCom, githubRaw, npmRegistry };
