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
            pass
        except Exception as e:
            err_msg = traceback.format_exc()
            print(f"@@ERROR@@:{{__phase}}:{err_msg}")
            # Do not exit, try next case
            continue

if __name__ == "__main__":
    main()
