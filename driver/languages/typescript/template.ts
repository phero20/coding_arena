"use strict";

import * as fs from "fs";
import { Scanner } from "./parts/scanner";
import { ListNode, TreeNode } from "./parts/data_structures";
import { serialize, compare } from "./parts/comparator";

// {{PART_SCANNER}}

// {{PART_DATA_STRUCTURES}}

// {{PART_COMPARATOR}}

// ---- USER SOLUTION ----
// {{USER_CODE}}
// ---- END USER SOLUTION ----

function main(): void {
    const sc = new Scanner();
    let __phase: string = "init";

    try {
        const num_cases: number = sc.nextInt();
        for (let i = 0; i < num_cases; i++) {
            __phase = "parse_inputs";
            // {{MAIN_LOOP}}
        }
    } catch (e) {
        // @ts-ignore
        process.stderr.write(`@@ERROR@@:${__phase}:${(e as any).message}\n`);
        process.exit(1);
    }
}

main();
