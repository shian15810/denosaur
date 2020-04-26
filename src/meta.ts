import { existsSync, readJsonSync } from "deno_std:fs";
import { dirname, resolve } from "deno_std:path";
import { assert } from "deno_std:testing/asserts.ts";

import { isPlainObject, isString } from "pika:is-what";

import { cwd } from "./deno.ts";

const getRoot = (current: string, root: string): string => {
  const dir = dirname(current);
  if (current === dir) return root;
  const file = resolve(current, "denosaur.json");
  const found = existsSync(file);
  if (found) return current;
  return getRoot(dir, root);
};

type DenosaurDependencies = { [dependency: string]: string };
type RawDenosaur = { dependencies?: DenosaurDependencies };
type Denosaur = RawDenosaur & { _dependencies: DenosaurDependencies };
const isRawDenosaur = (denosaur: unknown): denosaur is RawDenosaur =>
  isPlainObject(denosaur) &&
  (denosaur.dependencies === undefined ||
    (isPlainObject(denosaur.dependencies) &&
      Object.values(denosaur.dependencies).every(isString)));
const getDenosaur = (root: string): Denosaur => {
  const file = resolve(root, "denosaur.json");
  const found = existsSync(file);
  if (!found) return { _dependencies: {} };
  const denosaur = readJsonSync(file);
  assert(isRawDenosaur(denosaur), `${file} format is invalid.`);
  const rawDenosaur = Object.entries(denosaur).reduce(
    (raw: RawDenosaur, [key, value]) =>
      key.startsWith("_") ? raw : { ...raw, [key]: value },
    {},
  );
  const _dependencies = Object.entries(rawDenosaur.dependencies ?? {}).reduce(
    (dependencies: DenosaurDependencies, [dependency, version]) => {
      const deps = dependency.split(":");
      if (deps.length !== 2 || deps.includes("")) return dependencies;
      return { ...dependencies, [dependency]: version };
    },
    {},
  );
  return { ...rawDenosaur, _dependencies };
};

type ImportmapImports = { [map: string]: string };
type RawImportmap = { imports?: ImportmapImports };
type Importmap = RawImportmap & { _imports: ImportmapImports };
const isRawImportmap = (importmap: unknown): importmap is RawImportmap =>
  isPlainObject(importmap) &&
  (importmap.imports === undefined ||
    (isPlainObject(importmap.imports) &&
      Object.values(importmap.imports).every(isString)));
const getImportmap = (root: string): Importmap => {
  const file = resolve(root, "import_map.json");
  const found = existsSync(file);
  if (!found) return { _imports: {} };
  const importmap = readJsonSync(file);
  assert(isRawImportmap(importmap), `${file} format is invalid.`);
  const rawImportmap = Object.entries(importmap).reduce(
    (raw: RawImportmap, [key, value]) =>
      key.startsWith("_") ? raw : { ...raw, [key]: value },
    {},
  );
  const _imports = Object.entries(rawImportmap.imports ?? {}).reduce(
    (imports: ImportmapImports, [map, url]) => {
      const maps = map.split(":");
      if (maps.length !== 2 || maps.includes("")) return imports;
      return { ...imports, [map]: url };
    },
    {},
  );
  return { ...rawImportmap, _imports };
};

class Meta {
  #root = getRoot(cwd(), cwd());
  #denosaur = getDenosaur(this.#root);
  #importmap = getImportmap(this.#root);

  get denosaur(): Denosaur {
    return this.#denosaur;
  }
  get importmap(): Importmap {
    return this.#importmap;
  }
}

export default Meta;
