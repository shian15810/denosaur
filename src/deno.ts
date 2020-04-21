import * as flags from "deno_std:flags";

type Args = flags.Args & { "--"?: string[] };

type Env = { GITHUB_TOKEN?: string };

const { _, "--": dashdash }: Args = flags.parse(Deno.args, { "--": true });

const args = { _: _.map((arg) => arg.toString()), "--": dashdash ?? [] };

const cwd = Deno.cwd();

const env: Env = Deno.env();

export { args, cwd, env };
