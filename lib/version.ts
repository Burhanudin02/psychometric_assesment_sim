import pkg from "@/package.json";

export const APP_VERSION = pkg.version;
export const RELEASE_TAG = `v${pkg.version}`;
export const IS_BETA = pkg.version.includes("beta");
export const BETA_BADGE_TEXT = `BETA · v${pkg.version}`;
export const APP_NAME = "Cognitive Assessment Simulator";

export function getVersionInfo() {
  return {
    version: APP_VERSION,
    tag: RELEASE_TAG,
    isBeta: IS_BETA,
    badgeText: BETA_BADGE_TEXT,
    name: APP_NAME,
  };
}
