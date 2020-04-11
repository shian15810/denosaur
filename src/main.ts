import * as flags from "deno_std:flags";
import * as log from "deno_std:log";

import DenoStd from "./registries/deno_std.ts";
import DenoX from "./registries/deno_x.ts";
import Pika from "./registries/pika.ts";
import Unpkg from "./registries/unpkg.ts";
import subcommands from "./subcommands/mod.ts";

const { args } = Deno;

const main = async (): Promise<void> => {
  await log.setup({});

  const arg = flags.parse(args, { "--": true });
  const arg0 = arg._[0];
  const scmd = typeof arg0 === "string" ? arg0 : "didYouMean";
  if (Object.keys(subcommands).includes(scmd)) subcommands[scmd](arg);
  else subcommands.didYouMean(arg);

  const denoStd = await DenoStd();
  console.log(denoStd);

  const denoX = await DenoX();
  console.log(denoX);

  const pika = await Pika();
  console.log(pika);

  const unpkg = await Unpkg();
  console.log(unpkg);
};

export default main;
