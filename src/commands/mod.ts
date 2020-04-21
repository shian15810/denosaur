import add from "./add.ts";
import install from "./install.ts";
import list from "./list.ts";
import outdated from "./outdated.ts";
import update from "./update.ts";
import upgrade from "./upgrade.ts";

enum CommandName {
  Add = "add",
  Install = "install",
  List = "list",
  Outdated = "outdated",
  Update = "update",
  Upgrade = "upgrade",
}

type Commands = { [command in CommandName]: () => Promise<void> };

const isCommandName = (command: string): command is CommandName =>
  Object.values<string>(CommandName).includes(command);

const commands: Commands = { add, install, list, outdated, update, upgrade };

export { isCommandName };
export default commands;

export { default as didYouMean } from "./did_you_mean.ts";
export { default as noCommand } from "./no_command.ts";
