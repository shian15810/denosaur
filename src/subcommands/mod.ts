import * as flags from "deno_std:flags";

import add from "./add.ts";
import didYouMean from "./did_you_mean.ts";
import noSubcommand from "./no_subcommand.ts";

type Subcommands = { [subcommand: string]: (arg: flags.Args) => Promise<void> };

const subcommands: Subcommands = { add, didYouMean, noSubcommand };

export default subcommands;
