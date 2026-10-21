import versionMeta from "../../../../version.json";

function bumpPatch(v: string): string {
  const [major, minor, patch] = v.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

const isProd = process.env.NODE_ENV === "production";

const number = isProd
  ? versionMeta.version
  : versionMeta.released
    ? bumpPatch(versionMeta.version)
    : versionMeta.version;

export const APP_CODENAME = versionMeta.codename;
export const APP_VERSION_NUMBER = number;
export const APP_VERSION = `${versionMeta.codename} v${number}${isProd ? "" : "-dev"}`;
