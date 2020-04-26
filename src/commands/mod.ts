import add from "./add.ts";

enum Command {
  Add = "add",
}
const isCommand = (command: string): command is Command =>
  Object.values<string>(Command).includes(command);

type Commands = { [command in Command]: (inputs: string[]) => Promise<void> };
const commands: Commands = { add };

export { isCommand };
export default commands;
