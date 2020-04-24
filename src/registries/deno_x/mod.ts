import * as semver from "pika:semver";

import * as init from "./init.ts";
import * as resolve from "./resolve.ts";
import * as types from "./types.ts";
import * as wretch from "../../wretch.ts";

class DenoX {
  #database: types.Database = {};
  #registry: types.Registry = {};
  #inited = false;

  init = async (): Promise<void> => {
    if (this.#inited) return;

    this.#inited = true;
    this.#database = await init.getDatabase();
    this.#registry = init.toRegistry(this.#database);
  };

  resolve = async (
    module: string,
    version: string,
  ): Promise<string | undefined> => {
    const entry = this.#registry[module];

    if (entry === undefined) return;

    if (entry.type === types.RegistryModuleType.Github) {
      const { owner, repo } = entry;
      const githubVersion = await resolve.getGithubVersion(owner, repo);
      if (githubVersion === undefined) return;
      this.#registry[module] = {
        ...entry,
        ...githubVersion,
      };
    } else if (entry.type === types.RegistryModuleType.Npm) {
      const { name } = entry;
      const npmVersion = await resolve.getNpmVersion(name);
      if (npmVersion === undefined) return;
      this.#registry[module] = { ...entry, ...npmVersion };
    }

    if (semver.validRange(version)) {
      return (
        semver.maxSatisfying(this.#registry[module].versions, version) ??
        undefined
      );
    }

    if (this.#registry[module].alias[version] !== undefined) {
      return this.#registry[module].alias[version];
    }

    if (entry.type === types.RegistryModuleType.Github) {
      const tree = await wretch.githubCom
        .url(`/denoland/deno/tree/${version}`)
        .head()
        .notFound(() => false)
        .res(() => true);
      if (tree) return version;
    }
  };
}

export default DenoX;

const denoX = new DenoX();
await denoX.init();

console.log(await denoX.resolve("std_old", "latest"));
console.log(await denoX.resolve("unexpected", "master"));
