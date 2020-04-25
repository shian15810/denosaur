import { Args, parse } from "deno_std:flags";
import { grantOrThrow } from "deno_std:permissions";

const cwd = (): string => Deno.cwd();

type Env = { GITHUB_TOKEN?: string };
const env = (): Env => Deno.env();

type Flags = { _: string[]; "--": string[] };
const flags = (): Flags => {
  const args: Args & { "--"?: string[] } = parse(Deno.args, { "--": true });
  return { _: args._.map((arg) => arg.toString()), "--": args["--"] ?? [] };
};

const permissions = (): Promise<void> => {
  const names: Deno.PermissionName[] = ["env", "net", "read", "run", "write"];
  return grantOrThrow(names.map((name) => ({ name })));
};

export { cwd, env, flags, permissions };
