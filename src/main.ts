import commands from "./commands/mod.ts";
import * as deno from "./deno.ts";

const main = async (): Promise<void> => {
  const [command] = deno.args._;
  if (command !== undefined) await commands[command]?.();
};

export default main;
