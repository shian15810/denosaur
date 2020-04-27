import { fetchNpmRegistry } from "../fetch.ts";
import { isNotUndefined, isUndefined } from "../utils.ts";

type NpmVercument = {
  versions: string[];
  deprecateds: string[];
  aliases: { [alias in string]?: string } & { latest: string };
};
const getNpmVercument = async (
  module: string,
): Promise<NpmVercument | undefined> => {
  type NpmPackument = {
    "dist-tags": { [tag in string]?: string } & { latest: string };
    versions: { [version: string]: { version: string; deprecated?: string } };
  };
  const npmPackument: NpmPackument | undefined = await fetchNpmRegistry
    .url(`/${module}`)
    .get()
    .notFound(() => undefined)
    .json();
  if (isUndefined(npmPackument)) return;
  const versions = Object.keys(npmPackument.versions);
  const deprecateds = Object.values(npmPackument.versions)
    .filter(({ deprecated }) => isNotUndefined(deprecated))
    .map(({ version }) => version);
  const aliases = npmPackument["dist-tags"];
  return { versions, deprecateds, aliases };
};

export { getNpmVercument };
