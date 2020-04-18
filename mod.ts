import main from "./src/main.ts";

if (import.meta.main) await main();

export * from "./src/lib.ts";
