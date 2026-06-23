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
            } finally {
                for (java.lang.reflect.Field f : {{TARGET_CLASS}}.class.getDeclaredFields()) {
                    if (java.lang.reflect.Modifier.isStatic(f.getModifiers()) && !java.lang.reflect.Modifier.isFinal(f.getModifiers())) {
                        f.setAccessible(true);
                        try {
                            if (!f.getType().isPrimitive()) f.set(null, null);
                            else if (f.getType() == boolean.class) f.setBoolean(null, false);
                            else if (f.getType() == byte.class) f.setByte(null, (byte)0);
                            else if (f.getType() == short.class) f.setShort(null, (short)0);
                            else if (f.getType() == char.class) f.setChar(null, '\u0000');
                            else if (f.getType() == int.class) f.setInt(null, 0);
                            else if (f.getType() == long.class) f.setLong(null, 0L);
                            else if (f.getType() == float.class) f.setFloat(null, 0.0f);
                            else if (f.getType() == double.class) f.setDouble(null, 0.0);
                        } catch (Exception e) {}
                    }
                }
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
