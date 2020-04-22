import * as fs from "deno_std:fs";
import * as path from "deno_std:path";

import * as what from "pika:is-what";

import * as deno from "./deno.ts";

type Denosaur = { dependencies?: { [dependency: string]: string } };

type Importmap = { imports?: { [map: string]: string } };

const getRoot = async (cwd: string): Promise<string | undefined> => {
  const dirname = path.dirname(cwd);
  if (cwd === dirname) return;
  const filename = path.resolve(cwd, "denosaur.json");
  const exists = await fs.exists(filename);
  if (exists) return cwd;
  return getRoot(dirname);
};

const isDenosaur = (denosaur: unknown): denosaur is Denosaur =>
  what.isPlainObject(denosaur) &&
  (denosaur.dependencies === undefined ||
    (what.isPlainObject(denosaur.dependencies) &&
      Object.values(denosaur.dependencies).every(
        (range) => typeof range === "string",
      )));
const getDenosaur = async (root: string): Promise<Denosaur | undefined> => {
  const filename = path.resolve(root, "denosaur.json");
  const exists = await fs.exists(filename);
  if (!exists) return undefined;
  const denosaur = await fs.readJson(filename);
  if (!isDenosaur(denosaur)) return undefined;
  return denosaur;
};

const isImportmap = (importmap: unknown): importmap is Importmap =>
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
  if (!isImportmap(importmap)) return undefined;
  return importmap;
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
