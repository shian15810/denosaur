import wretch from "pika:wretch";

const fetchNpmRegistry = wretch("https://registry.npmjs.org").accept(
  "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
);

export { fetchNpmRegistry };
