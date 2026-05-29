#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <math.h>
#include <time.h>
#include <setjmp.h>
#include <signal.h>

typedef struct {
    char* buffer;
    size_t capacity;
} Scanner;

struct ListNode {
    int val;
    struct ListNode *next;
};

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};


// {{PART_SCANNER}}
// {{PART_DATA_STRUCTURES}}
// {{PART_COMPARATOR}}

// {{USER_CODE}}

static jmp_buf jump_buffer;
static char* __phase = "init";

void signal_handler(int sig) {
    fprintf(stderr, "@@ERROR@@:%s:Signal %d caught\n", __phase, sig);
    exit(sig);
}

int main() {
    signal(SIGSEGV, signal_handler);
    signal(SIGFPE, signal_handler);

    Scanner sc = create_scanner();
    char* num_cases_str = next(&sc);
    if (num_cases_str == NULL || strlen(num_cases_str) == 0) return 0;
    int num_cases = atoi(num_cases_str);

    double EPS = 1e-6;
    bool UNORDERED = false;

    for (int i = 0; i < num_cases; ++i) {
        __phase = "parse_inputs";
        // {{DRIVER_LOGIC_PLACEHOLDER}}
    }

    destroy_scanner(&sc);
    return 0;
}
