import commands, { isCommand } from "./commands/mod.ts";
import { flags, permissions } from "./deno.ts";

const main = async (): Promise<void> => {
  await permissions();
  const [command, ...inputs] = flags()._;
  if (isCommand(command)) return commands[command](inputs);
};

export default main;
