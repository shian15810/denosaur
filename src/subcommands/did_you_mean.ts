import * as flags from "deno_std:flags";

const didYouMean = async (arg: flags.Args): Promise<void> => {
  await Promise.resolve();

  console.log(arg);
};

export default didYouMean;
