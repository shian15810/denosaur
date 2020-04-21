import * as semver from "pika:semver";

import * as init from "./init.ts";
import * as types from "./types.ts";

import json from "./database.json";

class DenoStd {
  #latest?: string;
  #versions?: types.Version[];
  #database: types.Database = json;
  #dependencies: types.Dependencies = {};
  #registry: types.Registry = {};
  #inited = false;

  init = async (dependencies: types.Dependencies): Promise<void> => {
    if (this.#inited) return;

    this.#database = { ...this.#database, ...(await init.getJson()) };
    if (!(await init.getExist())) {
      this.#inited = true;
      return;
    }

    this.#latest = await init.getLatest();
    if (this.#latest === undefined) {
      this.#versions = await init.getVersions();
      this.#latest = semver.maxSatisfying(
        this.#versions.map(({ version }) => version),
        "*",
      ) ?? undefined;
    }
    if (
      this.#latest !== undefined &&
      Object.keys(this.#database).includes(this.#latest)
    ) {
      this.#dependencies = init.validateDependencies(dependencies);
      this.#registry = init.toRegistry(
        this.#database,
        Object.keys(this.#dependencies),
      );
      this.#registry = init.initRegistry(this.#registry, this.#latest);
      this.#inited = true;
      return;
    }

    if (this.#versions === undefined) this.#versions = await init.getVersions();
    this.#versions = this.#versions.filter(
      ({ version }) => this.#database[version] === undefined,
    );
    this.#database = {
      ...this.#database,
      ...(await init.getDatabase(this.#versions)),
    };
    this.#dependencies = init.validateDependencies(dependencies);
    this.#registry = init.toRegistry(
      this.#database,
      Object.keys(this.#dependencies),
    );
    this.#registry = init.initRegistry(this.#registry, this.#latest);
    this.#inited = true;
  };
}

export default DenoStd;
