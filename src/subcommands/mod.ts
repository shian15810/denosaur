import * as flags from "deno_std:flags";

import add from "./add.ts";
import didYouMean from "./did_you_mean.ts";

type Subcommands = { [subcommand: string]: (arg: flags.Args) => Promise<void> };

const subcommands: Subcommands = { add, didYouMean };

export default subcommands;
