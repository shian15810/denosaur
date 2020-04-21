import commands, * as command from "./commands/mod.ts";
import * as deno from "./deno.ts";

const main = (): Promise<void> => {
  const [cmd] = deno.args._;
  if (cmd === undefined) return command.noCommand();
  if (command.isCommandName(cmd)) return commands[cmd]();
  return command.didYouMean();
};

export default main;
