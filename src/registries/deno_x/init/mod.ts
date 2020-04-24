import * as semver from 'pika:semver';

import * as github from './github.ts';
import * as types from '../types.ts';
import * as wretch from '../../../wretch.ts';

const getDatabase = (): Promise<types.Database> =>
  wretch.githubRaw
    .url('/denoland/deno_website2/master/src/database.json')
    .get()
    .json();

const validateDependencies = (dependencies: types.Dependencies) =>
  Object.entries(dependencies).reduce(
    (deps: types.Dependencies, [mod, rng]) =>
      semver.validRange(rng) === null ? deps : { ...deps, [mod]: rng },
    {},
  );

const toRegistry = (
  database: types.Database,
  modules: string[],
): types.Registry =>
  Object.entries(database).reduce(
    (registry: types.Registry, [module, entry]) => {
      if (!modules.includes(module)) return registry;
      if (entry.type === types.DatabaseModuleType.Github) {
        const { owner, repo, path } = entry;
        return {
          ...registry,
          [module]: {
            type: types.RegistryModuleType.Github,
            owner,
            repo,
            path:
              path
                ?.split('/')
                .filter((seg) => seg !== '')
                .join('/') ?? '',
            alias: {},
            versions: [],
            drafts: [],
            prereleases: [],
            deprecateds: [],
          },
        };
      }
      const { url } = entry;
      const { hostname, pathname } = new URL(url);
      if (['cdn.pika.dev', 'unpkg.com'].includes(hostname)) {
        const [, seg1, seg2] = pathname.split('/');
        const dependency = seg1.startsWith('@') ? `${seg1}/${seg2}` : seg1;
        const [dep0, dep1] = dependency.split('@');
        const npm = dependency.startsWith('@') ? `@${dep1}` : dep0;
        return {
          ...registry,
          [module]: {
            type: types.RegistryModuleType.Npm,
            url: url.replace('${b}', '%s').replace('${v}', '%s'),
            npm,
            alias: {},
            versions: [],
            deprecateds: [],
          },
        };
      }
      return registry;
    },
    {},
  );

const initRegistry = async (registry: types.Registry) => {
  const entries = await Promise.all(
    Object.entries(registry).map(
      async ([module, entry]): Promise<
        [string, types.RegistryModule] | undefined
      > => {
        if (entry.type === types.RegistryModuleType.Github) {
          const { owner, repo } = entry;
          const exists = await github.getExists(owner, repo);
          if (!exists) return undefined;
          const latest = await github.getLatest(owner, repo);
          const version = await github.getVersion(owner, repo);
          return [
            module,
            {
              ...entry,
              alias: {
                ...entry.alias,
                latest:
                  latest !== undefined && version.versions.includes(latest)
                    ? latest
                    : semver.maxSatisfying(version.versions, '*') ?? 'master',
              },
              ...version,
            },
          ];
        }
        // if (entry.type === types.RegistryModuleType.Npm) {
        //   const { npm } = entry;
        //   return [module, entry];
        // }
        return [module, entry];
      },
    ),
  );
  return Object.fromEntries(
    entries.filter(
      (entry): entry is [string, types.RegistryModule] => entry !== undefined,
    ),
  );
};

export { getDatabase, initRegistry, toRegistry, validateDependencies };
