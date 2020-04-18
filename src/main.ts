import commands, { didYouMean, noCommand } from "./commands/mod.ts";
import * as deno from "./deno.ts";

const main = (): Promise<void> => {
  const [command] = deno.args._;
  if (command === undefined) return noCommand();
  return (commands[command] ?? didYouMean)();
};

export default main;
