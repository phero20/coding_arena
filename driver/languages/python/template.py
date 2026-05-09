import sys
import traceback
import time

# {{PART_SCANNER}}
# {{PART_DATA_STRUCTURES}}
# {{PART_COMPARATOR}}

# {{USER_CODE}}

def main():
    sc = Scanner()
    num_cases_token = sc.next()
    if num_cases_token is None: return
    num_cases = int(num_cases_token)

    EPS = 1e-6
    UNORDERED = False

    for i in range(num_cases):
        __phase = "parse_inputs"
        try:
# {{DRIVER_LOGIC_PLACEHOLDER}}
            __phase = "verify_sync"
            sentinel = sc.next()
            if sentinel != "@@CASE_END@@":
                raise Exception(f"Input desync detected! Expected @@CASE_END@@ but got: {sentinel}")
        except Exception as e:
            # We print the structured error for the parser
            print(f"@@ERROR@@:case={i} phase={__phase} msg={type(e).__name__}:{str(e)}")
            # We also print the full traceback to stderr for debugging
            traceback.print_exc(file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
