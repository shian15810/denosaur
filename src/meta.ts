import * as fs from "deno_std:fs";
import * as path from "deno_std:path";

import * as what from "pika:is-what";

import * as deno from "./deno.ts";

type Denosaur = { dependencies?: { [dependency: string]: string } };

type Importmap = { imports?: { [map: string]: string } };

const getRoot = async (
  from: string,
  to: string,
): Promise<string | undefined> => {
  if (from === to) return undefined;
  const file = path.resolve(from, "denosaur.json");
  const exist = await fs.exists(file);
  if (exist) return from;
  const parent = path.resolve(from, "..");
  return getRoot(parent, to);
};

const isDenosaur = (denosaur: unknown): denosaur is Denosaur =>
  what.isPlainObject(denosaur) &&
  (denosaur.dependencies === undefined ||
    (what.isPlainObject(denosaur.dependencies) &&
      Object.values(denosaur.dependencies).every(
        (range) => typeof range === "string",
      )));
const getDenosaur = async (root: string): Promise<Denosaur | undefined> => {
  const file = path.resolve(root, "denosaur.json");
  const exist = await fs.exists(file);
  if (!exist) return undefined;
  const denosaur = await fs.readJson(file);
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
  const file = path.resolve(root, "import_map.json");
  const exist = await fs.exists(file);
  if (!exist) return undefined;
  const importmap = await fs.readJson(file);
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

    this.#root = await getRoot(deno.cwd, path.parse(deno.cwd).root);
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
