import {
  maxSatisfying as semverMaxSatisfying,
  validRange as semverValidRange,
} from "pika:semver";

const maxSatisfying = (versions: string[], range: string): string | undefined =>
  semverMaxSatisfying(versions, range) ?? undefined;

const validRange = (range: string): string | undefined =>
  semverValidRange(range) ?? undefined;

export { maxSatisfying, validRange };
