import { maxSatisfying, validRange } from "../semver.ts";
import { npmRegistry } from "../wretch.ts";

type NpmVersion = { versions: string[]; alias: { [tag: string]: string } };
const getNpmVersion = async (
  module: string,
): Promise<NpmVersion | undefined> => {
  type Metadata = {
    "dist-tags": NpmVersion["alias"];
    versions: { [version: string]: unknown };
  };
  const metadata: Metadata | undefined = await npmRegistry
    .url(`/${module}`)
    .get()
    .notFound(() => undefined)
    .json();
  if (metadata === undefined) return;
  const versions = Object.keys(metadata.versions);
  return { versions, alias: metadata["dist-tags"] };
};

class Pika {
  resolve = async (
    module: string,
    version: string,
  ): Promise<string | undefined> => {
    const npmVersion = await getNpmVersion(module);
    if (npmVersion === undefined) return;
    const { versions, alias } = npmVersion;
    if (validRange(version)) return maxSatisfying(versions, version);
    return alias[version];
  };
  url = (module: string, version: string): string =>
    `https://cdn.pika.dev/${module}@v${version}`;
  mod = (): boolean => false;
}

export default Pika;

// const pika = new Pika();

// console.log(await pika.resolve("by-node-env", "latest"));
// console.log(await pika.resolve("by-node-env", "*"));
// console.log(await pika.resolve("by-node-env", ">1"));
// console.log(await pika.resolve("by-node-env", ">1.0"));
// console.log(await pika.resolve("by-node-env", ">1.0.0"));
// console.log(await pika.resolve("by-node-env", ">=1"));
// console.log(await pika.resolve("by-node-env", ">=1.0"));
// console.log(await pika.resolve("by-node-env", ">=1.0.0"));
// console.log(await pika.resolve("by-node-env", "^1.0.0"));
