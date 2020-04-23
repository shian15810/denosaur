import * as fs from "deno_std:fs";
import * as path from "deno_std:path";
import * as asserts from "deno_std:testing/asserts.ts";

import * as what from "pika:is-what";

import * as deno from "./deno.ts";

type RawDenosaur = { dependencies?: { [dependency: string]: string } };
type DenosaurDependencies = {
  [registry: string]: { [module: string]: string };
};
type Denosaur = RawDenosaur & { _dependencies: DenosaurDependencies };

type RawImportmap = { imports?: { [map: string]: string } };
type ImportmapImports = { [registry: string]: { [module: string]: string } };
type Importmap = RawImportmap & { _imports: ImportmapImports };

const getRoot = (cwd: string, root: string): string => {
  const dirname = path.dirname(cwd);
  if (cwd === dirname) return root;
  const filename = path.resolve(cwd, "denosaur.json");
  const exists = fs.existsSync(filename);
  if (exists) return cwd;
  return getRoot(dirname, root);
};

const isRawDenosaur = (denosaur: unknown): denosaur is RawDenosaur =>
  what.isPlainObject(denosaur) &&
  (denosaur.dependencies === undefined ||
    (what.isPlainObject(denosaur.dependencies) &&
      Object.values(denosaur.dependencies).every(
        (version) => typeof version === "string",
      )));
const getDenosaur = (root: string): Denosaur => {
  const filename = path.resolve(root, "denosaur.json");
  const exists = fs.existsSync(filename);
  if (!exists) return { _dependencies: {} };
  const denosaur = fs.readJsonSync(filename);
  asserts.assert(isRawDenosaur(denosaur), `${filename} format is invalid.`);
  const rawDenosaur = Object.entries(denosaur).reduce(
    (raw: RawDenosaur, [key, value]) =>
      key.startsWith("_") ? raw : { ...raw, [key]: value },
    {},
  );
  const _dependencies = Object.entries(rawDenosaur.dependencies ?? {}).reduce(
    (dependencies: DenosaurDependencies, [dependency, version]) => {
      const deps = dependency.split(":");
      if (deps.length !== 2 || deps.includes("")) return dependencies;
      const [registry, module] = deps;
      return {
        ...dependencies,
        [registry]: { ...(dependencies[registry] ?? {}), [module]: version },
      };
    },
    {},
  );
  return { ...rawDenosaur, _dependencies };
};

const isRawImportmap = (importmap: unknown): importmap is RawImportmap =>
  what.isPlainObject(importmap) &&
  (importmap.imports === undefined ||
    (what.isPlainObject(importmap.imports) &&
      Object.values(importmap.imports).every(
        (url) => typeof url === "string",
      )));
const getImportmap = (root: string): Importmap => {
  const filename = path.resolve(root, "import_map.json");
  const exists = fs.existsSync(filename);
  if (!exists) return { _imports: {} };
  const importmap = fs.readJsonSync(filename);
  asserts.assert(isRawImportmap(importmap), `${filename} format is invalid.`);
  const rawImportmap = Object.entries(importmap).reduce(
    (raw: RawImportmap, [key, value]) =>
      key.startsWith("_") ? raw : { ...raw, [key]: value },
    {},
  );
  const _imports = Object.entries(rawImportmap.imports ?? {}).reduce(
    (imports: ImportmapImports, [map, url]) => {
      const maps = map.split(":");
      if (maps.length !== 2 || maps.includes("")) return imports;
      const [registry, module] = maps;
      return {
        ...imports,
        [registry]: { ...(imports[registry] ?? {}), [module]: url },
      };
    },
    {},
  );
  return { ...rawImportmap, _imports };
};

class Meta {
  #root = getRoot(deno.cwd, deno.cwd);
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
