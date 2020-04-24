import * as fs from "deno_std:fs";
import * as path from "deno_std:path";

import * as init from "./init.ts";
import * as types from "./types.ts";

const getDatabase = async (): Promise<types.Database> => {
  const versions = await init.getVersions();
  return init.getDatabaseFromVersions(versions);
};

const writeDatabase = (database: types.Database): Promise<void> => {
  const { pathname } = new URL(import.meta.url);
  const dirname = path.dirname(pathname);
  const filename = path.resolve(dirname, "database.json");
  return fs.writeJson(filename, database, { spaces: 2 });
};

const database = async (): Promise<void> => {
  const db = await getDatabase();
  return writeDatabase(db);
}

if (import.meta.main) await database();

export default database;
