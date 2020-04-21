import * as semver from "pika:semver";

import * as init from "./init.ts";
import * as types from "./types.ts";

import json from "./database.json";

class DenoStd {
  #latest?: string;
  #versions?: types.Version[];
  #database: types.Database = json;
  #registry: types.Registry = {};
  #dependencies: types.Dependencies = {};
  #inited = false;

  init = async (dependencies: types.Dependencies): Promise<void> => {
    if (this.#inited) return;

    this.#latest = await init.getLatest();
    if (this.#latest === undefined) {
      this.#versions = await init.getVersions();
      this.#latest = semver.maxSatisfying(
        this.#versions.map(({ version }) => version),
        "*",
      ) ?? undefined;
      if (this.#latest === undefined) return;
    }

    this.#database = init.mergeDatabases(
      this.#database,
      await init.getJson(),
      this.#latest,
    );
    if (this.#database[this.#latest]?.latest ?? false) {
      this.#registry = init.toRegistry(this.#database);
      this.#dependencies = init.toDependencies(this.#registry, dependencies);
      this.#registry = init.cacheRegistry(
        this.#registry,
        Object.keys(this.#dependencies),
      );
      this.#inited = true;
      return;
    }

    if (this.#versions === undefined) this.#versions = await init.getVersions();
    this.#versions = this.#versions.filter(
      ({ version }) => this.#database[version] === undefined,
    );
    this.#database = init.mergeDatabases(
      this.#database,
      await init.getDatabase(this.#versions),
      this.#latest,
    );
    this.#registry = init.toRegistry(this.#database);
    this.#dependencies = init.toDependencies(this.#registry, dependencies);
    this.#registry = init.cacheRegistry(
      this.#registry,
      Object.keys(this.#dependencies),
    );
    this.#inited = true;
  };
}

export default DenoStd;
