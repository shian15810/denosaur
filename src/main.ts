import * as flags from "https://deno.land/std/flags/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

import DenoStd from "./registries/deno_std.ts";
import DenoX from "./registries/deno_x.ts";

const { args } = Deno;

const main = async (): Promise<void> => {
  await log.setup({});

  console.log(flags.parse(args));

  const denoStd = await DenoStd();
  console.log(denoStd);

  const denoX = await DenoX();
  console.log(denoX);
};

export default main;
