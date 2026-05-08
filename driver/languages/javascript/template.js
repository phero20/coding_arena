"use strict";

const fs = require('fs');

// {{PART_SCANNER}}

// {{PART_DATA_STRUCTURES}}

// {{PART_COMPARATOR}}

// ---- USER SOLUTION ----
{{USER_CODE}}
// ---- END USER SOLUTION ----

function main() {
    const sc = new Scanner();
    let __phase = "init";

    try {
        const num_cases = sc.nextInt();
        for (let i = 0; i < num_cases; i++) {
            __phase = "parse_inputs";
            {{MAIN_LOOP}}
        }
    } catch (e) {
        process.stderr.write(`@@ERROR@@:${__phase}:${e.message}\n`);
        process.exit(1);
    }
}

main();
