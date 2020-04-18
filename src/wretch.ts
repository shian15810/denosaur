import wretch, { Wretcher } from "pika:wretch";

import * as deno from "./deno.ts";

const getGithubApi = (token?: string): Wretcher => {
  const wretcher = wretch("https://api.github.com");
  if (token === undefined) return wretcher;
  return wretcher.auth(`Bearer ${token}`);
};

const getGithubRaw = (): Wretcher =>
  wretch("https://raw.githubusercontent.com");

export const githubApi = getGithubApi(deno.env.GITHUB_TOKEN);

export const githubRaw = getGithubRaw();
