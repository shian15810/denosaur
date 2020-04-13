import * as yaml from "deno_std:encoding/yaml.ts";
import * as fs from "deno_std:fs";
import * as path from "deno_std:path";
import meant from "jspm:meant";

import denosaurJson from "../denosaur.json";

enum DenosaurFileName {
  Yaml = "denosaur.yaml",
  Yml = "denosaur.yml",
  Json = "denosaur.json",
}
enum DenosaurFileType {
  Yaml = "yaml",
  Json = "json",
}
type DenosaurFileParse = (file: string) => unknown;
type DenosaurFileYaml = {
  type: DenosaurFileType.Yaml;
  parse: DenosaurFileParse;
};
type DenosaurFileJson = {
  type: DenosaurFileType.Json;
  parse: DenosaurFileParse;
};
type DenosaurFile = {
  [DenosaurFileName.Yaml]: DenosaurFileYaml;
  [DenosaurFileName.Yml]: DenosaurFileYaml;
  [DenosaurFileName.Json]: DenosaurFileJson;
};

const { cwd } = Deno;

const denosaurFile: DenosaurFile = {
  [DenosaurFileName.Yaml]: { type: DenosaurFileType.Yaml, parse: yaml.parse },
  [DenosaurFileName.Yml]: { type: DenosaurFileType.Yaml, parse: yaml.parse },
  [DenosaurFileName.Json]: { type: DenosaurFileType.Json, parse: JSON.parse },
};

const getDenosaur = (): Promise<string | undefined> => {
  const filenames = Object.keys(denosaurFile);
  const currentpath = cwd();
  const { root: rootpath } = path.parse(currentpath);

  const recursion = async (dirpath: string): Promise<string | undefined> => {
    if (dirpath === rootpath) return undefined;
    const filepaths = await Promise.all(filenames.map(async (filename) => {
      const filepath = path.resolve(dirpath, filename);
      const exist = await fs.exists(filepath);
      return exist ? filepath : undefined;
    }));
    return recursion(path.resolve(dirpath, ".."));
  };

  return recursion(currentpath);
};

const denosaur = async () => {
  console.log(denosaurJson);
  console.log(meant);
};

export default denosaur;
