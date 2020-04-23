import * as fs from "deno_std:fs";
import * as path from "deno_std:path";

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

const getRoot = async (cwd: string): Promise<string | undefined> => {
  const dirname = path.dirname(cwd);
  if (cwd === dirname) return;
  const filename = path.resolve(cwd, "denosaur.json");
  const exists = await fs.exists(filename);
  if (exists) return cwd;
  return getRoot(dirname);
};

const isRawDenosaur = (denosaur: unknown): denosaur is RawDenosaur =>
  what.isPlainObject(denosaur) &&
  (denosaur.dependencies === undefined ||
    (what.isPlainObject(denosaur.dependencies) &&
      Object.values(denosaur.dependencies).every(
        (version) => typeof version === "string",
      )));
const getDenosaur = async (root: string): Promise<Denosaur | undefined> => {
  const filename = path.resolve(root, "denosaur.json");
  const exists = await fs.exists(filename);
  if (!exists) return undefined;
  const denosaur = await fs.readJson(filename);
  if (!isRawDenosaur(denosaur)) return undefined;
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
const getImportmap = async (root: string): Promise<Importmap | undefined> => {
  const filename = path.resolve(root, "import_map.json");
  const exists = await fs.exists(filename);
  if (!exists) return undefined;
  const importmap = await fs.readJson(filename);
  if (!isRawImportmap(importmap)) return undefined;
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
  #root?: string;
  #denosaur?: Denosaur;
  #importmap?: Importmap;
  #inited = false;

  get root(): string | undefined {
    return this.#root;
  }
  get denosaur(): Denosaur | undefined {
    return this.#denosaur;
  }

  init = async (): Promise<void> => {
    if (this.#inited) return;

    this.#root = await getRoot(deno.cwd);
    if (this.#root === undefined) {
      this.#inited = true;
      return;
    }

    this.#denosaur = await getDenosaur(this.#root);
    this.#importmap = await getImportmap(this.#root);
    this.#inited = true;
  };
}

export default Meta;
