// deno task version (major | minor) # blank is patch/fix

import config from "../deno.json" with { type: "json" };

const CONFIG_PATH = "./deno.json";

const currentVersion = config.version;

const arg = Deno.args[0];

const [majorString, minorString, patchString] = currentVersion.split(".");

let major = Number(majorString);
let minor = Number(minorString);
let patch = Number(patchString);

if (arg === "major") {
  major++;
  minor = 0;
  patch = 0;
} else if (arg === "minor") {
  minor++;
  patch = 0;
} else {
  patch++;
}

const newVersion = `${major}.${minor}.${patch}`;

await Deno.readTextFile(CONFIG_PATH)
  .then((configContents) => {
    const updatedConfig = configContents.replace(
      /"version":.*,/,
      `"version": "${newVersion}",`,
    );

    return Deno.writeTextFile(CONFIG_PATH, updatedConfig);
  }).then(() => Deno.stdout.write(new TextEncoder().encode(newVersion))).then(
    () => {
      Deno.exit(0);
    },
  )
  .catch((error) => {
    console.error("An error occurred:", error);
    Deno.exit(1);
  });
