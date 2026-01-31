// Entry file
// initial installation typescript npm i -D typescript @types/node tsx

import { loadEnv } from "./env";
import { selectAndHello } from "./provider";

async function main() {
  loadEnv();

  try {
    const result = await selectAndHello();
    if (result.ok) {
      console.log(
        `Provider: ${result.provider}\nModel: ${result.model}\nMessage: ${result.message}`,
      );
    } else {
      console.error(
        `Error from provider ${result.provider} (model: ${result.model}): ${result.message}`,
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

main();
