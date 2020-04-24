import * as semver from "pika:semver";

import * as init from "./init.ts";
import * as types from "./types.ts";

import database from "./database.json";

class DenoStd {
  #latest?: string;
  #versions?: types.Version[];
  #database: types.Database = database;
  #registry: types.Registry = {};
  #inited = false;

  init = async (): Promise<void> => {
    if (this.#inited) return;

    this.#inited = true;
    this.#database = { ...this.#database, ...(await init.getDatabase()) };
    this.#latest = await init.getLatest();

    if (this.#latest === undefined) {
      this.#versions = await init.getVersions();
      this.#latest = semver.maxSatisfying(
        this.#versions.map(({ version }) => version),
        "*",
      ) ?? undefined;
    }

    if (
      this.#latest === undefined ||
      !Object.keys(this.#database).includes(this.#latest)
    ) {
      if (this.#versions === undefined) {
        this.#versions = await init.getVersions();
      }
      this.#versions = this.#versions.filter(
        ({ version }) => this.#database[version] === undefined,
      );
      this.#database = {
        ...this.#database,
        ...(await init.getDatabaseFromVersions(this.#versions)),
      };
    }

    this.#registry = init.toRegistry(this.#database);
  };
}

export default DenoStd;

const denoStd = new DenoStd();
denoStd.init();
