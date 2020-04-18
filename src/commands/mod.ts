import add from "./add.ts";
import install from "./install.ts";
import list from "./list.ts";
import outdated from "./outdated.ts";
import update from "./update.ts";

type Commands = { [command: string]: () => Promise<void> };

const commands: Commands = { add, install, list, outdated, update };

export default commands;

export { default as didYouMean } from "./did_you_mean.ts";
export { default as noCommand } from "./no_command.ts";
