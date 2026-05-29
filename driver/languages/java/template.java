import java.util.*;
import java.io.*;

{{PART_DATA_STRUCTURES}}

public class Main {
    static final double EPS = 1e-6;
    static final boolean UNORDERED = false;

    public static void main(String[] args) throws Exception {
        FastScanner sc = new FastScanner(System.in);
        Solution solution = new Solution();

        int numCases = sc.nextInt();

        for (int i = 0; i < numCases; i++) {
            String __phase = "parse_inputs";
            try {
                // {{DRIVER_LOGIC_PLACEHOLDER}}
                __phase = "verify_sync";
                String sentinel = sc.next();
                if (!sentinel.equals("@@CASE_END@@")) {
                    throw new RuntimeException("Input desync detected! Expected @@CASE_END@@ but got: " + sentinel);
                }
            } catch (Exception e) {
                System.out.println("@@ERROR@@:case=" + i + " phase=" + __phase + " msg=" + e.getClass().getSimpleName() + ":" + e.getMessage());
                return;
            }
        }
    }

{{PART_FAST_SCANNER}}

{{PART_SERIALIZER}}

{{PART_COMPARATOR}}

{{PART_BUILDERS}}
}

// --- USER CODE START ---
{{USER_CODE}}
// --- USER CODE END ---
