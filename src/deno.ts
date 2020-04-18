import * as flags from "deno_std:flags";

type Args = flags.Args & { "--"?: string[] };

type Env = { GITHUB_TOKEN?: string };

const { _, "--": dashdash }: Args = flags.parse(Deno.args, { "--": true });

export const args = { _: _.map((arg) => arg.toString()), "--": dashdash ?? [] };

export const cwd = Deno.cwd();

export const env: Env = Deno.env();
