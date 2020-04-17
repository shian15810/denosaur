export class FetchError extends Error {
  name = this.constructor.name;

  constructor({ status, statusText, url }: Response) {
    super();
    const { hostname } = new URL(url);
    if (hostname === "api.github.com" && status === 403) {
      this.message =
        "GitHub API rate limit exceeded, authenticate with environment variable GITHUB_TOKEN to get a higher rate limit.";
    } else this.message = `${status} ${statusText} ${url}`;
  }
}
