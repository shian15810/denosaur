import * as fs from "deno_std:fs";
import * as path from "deno_std:path";

import * as _ from "pika:lodash-es";

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
  _.isPlainObject(denosaur);
const getDenosaur = async (root: string): Promise<Denosaur | undefined> => {
  const file = path.resolve(root, "denosaur.json");
  const exist = await fs.exists(file);
  if (!exist) return undefined;
  const denosaur = await fs.readJson(file);
  if (!isDenosaur(denosaur)) return undefined;
  return denosaur;
};

const isImportmap = (importmap: unknown): importmap is Importmap =>
  _.isPlainObject(importmap);
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
  init = async (): Promise<this> => {
    if (this.#inited) return this;

    const { root } = path.parse(deno.cwd);
    this.#root = await getRoot(deno.cwd, root);

    if (this.#root === undefined) {
      this.#inited = true;
      return this;
    }

    this.#denosaur = await getDenosaur(this.#root);
    this.#importmap = await getImportmap(this.#root);
    this.#inited = true;
    return this;
  };
}

const meta = (): Promise<Meta> => new Meta().init();

export default meta;
