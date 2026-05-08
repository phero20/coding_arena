using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

public class Driver {
    private static string __phase = "init";

    public static void Main(string[] args) {
        try {
            Scanner scanner = new Scanner();
            int numTests = scanner.NextInt();

            for (int t = 0; t < numTests; t++) {
                __phase = "parse_inputs";
                {{MAIN_LOOP}}
            }
        } catch (Exception e) {
            Console.Error.WriteLine($"@@ERROR@@:{__phase}:{e.Message}");
            Environment.Exit(1);
        }
    }
}

// {{PART_SCANNER}}

// {{PART_DATA_STRUCTURES}}

// {{PART_COMPARATOR}}

{{USER_CODE}}
