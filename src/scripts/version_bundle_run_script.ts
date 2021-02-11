import os from "os";
import path from "path";

export function generateVersionBundleScript(
  scheme: string,
  destination: string,
  workspace?: string
) {
  return [
    `${
      process.env.GITHUB_WORKSPACE
        ? process.env.GITHUB_WORKSPACE
        : path.join(os.homedir(), "monologue")
    }/build-phase/dist/build-phase.latest.pkg`,
    `build-version-bundle`,
    `--scheme ${scheme}`,
    `--destination ${destination}`,
    workspace ? `--workspace ${workspace}` : "",
  ].join(" ");
}
