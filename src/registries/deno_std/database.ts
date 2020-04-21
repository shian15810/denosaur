import * as fs from "deno_std:fs";
import * as path from "deno_std:path";

import * as init from "./init.ts";
import * as types from "./types.ts";

const getDatabase = async (): Promise<types.Database | undefined> => {
  const exist = await init.getExist();
  if (!exist) return;
  const versions = await init.getVersions();
  return init.getDatabase(versions);
};

const writeDatabase = (database: types.Database): Promise<void> => {
  const { pathname } = new URL(import.meta.url);
  const file = path.resolve(path.dirname(pathname), "database.json");
  return fs.writeJson(file, database, { spaces: 2 });
};

const main = async (): Promise<void> => {
  const database = await getDatabase();
  if (database === undefined) return;
  return writeDatabase(database);
};

if (import.meta.main) await main();

export default main;
