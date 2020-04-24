import * as types from './types.ts';
import * as wretch from '../../wretch.ts';

const getDatabase = (): Promise<types.Database> =>
  wretch.githubRaw
    .url('/denoland/deno_website2/master/src/database.json')
    .get()
    .json();

const toRegistry = (
  database: types.Database,
): types.Registry =>
  Object.entries(database).reduce(
    (registry: types.Registry, [module, entry]) => {
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
            versioned: false,
            versions: [],
            drafts: [],
            prereleases: [],
            alias: {},
          },
        };
      }
      const { url } = entry;
      const { hostname, pathname } = new URL(url);
      if (['cdn.pika.dev', 'unpkg.com'].includes(hostname)) {
        const [, seg1, seg2] = pathname.split('/');
        const dependency = seg1.startsWith('@') ? `${seg1}/${seg2}` : seg1;
        const [dep0, dep1] = dependency.split('@');
        const name = dependency.startsWith('@') ? `@${dep1}` : dep0;
        return {
          ...registry,
          [module]: {
            type: types.RegistryModuleType.Npm,
            url: url.replace('${b}', '%s').replace('${v}', '%s'),
            name,
            versioned: false,
            versions: [],
            deprecateds: [],
            alias: {},
          },
        };
      }
      return registry;
    },
    {},
  );

export { getDatabase, toRegistry };
