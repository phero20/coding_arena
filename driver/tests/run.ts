import { generateExecutionPackage } from "../index";
import { fixtures } from "./fixtures";

async function main() {
  const failures: string[] = [];

  for (const f of fixtures) {
    try {
      const pkg = await generateExecutionPackage(f.opts);
      f.assert(pkg);
      // eslint-disable-next-line no-console
      console.log(`ok: ${f.name}`);
    } catch (e: any) {
      failures.push(`${f.name}: ${e?.message ?? e}`);
      // eslint-disable-next-line no-console
      console.error(`fail: ${f.name}`, e);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Driver fixture failures:\n${failures.join("\n")}`);
  }
}

main();

