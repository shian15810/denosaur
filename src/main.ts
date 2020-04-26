import { permissions } from "./deno.ts";

const main = async (): Promise<void> => {
  await permissions();
};

export default main;
