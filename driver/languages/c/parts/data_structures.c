char* serialize_int(int val) {
    char* s = (char*)malloc(32);
    if (!s) return NULL;
    sprintf(s, "%d", val);
    return s;
}

char* serialize_double(double val) {
    char* s = (char*)malloc(64);
    if (!s) return NULL;
    sprintf(s, "%.6f", val);
    char* p = s + strlen(s) - 1;
    while (p > s && *p == '0') *p-- = '\0';
    if (*p == '.') *p = '\0';
    return s;
}

char* serialize_bool(bool val) {
    return strdup(val ? "true" : "false");
}

char* serialize_string(char* val) {
    if (!val) return strdup("null");
    return strdup(val);
}

char* serialize_list(struct ListNode* head) {
    if (!head) return strdup("[]");
    size_t cap = 1024 * 8;
    char* res = (char*)malloc(cap);
    if (!res) return NULL;
    strcpy(res, "[");
    struct ListNode* curr = head;
    while (curr) {
        char temp[32];
        sprintf(temp, "%d", curr->val);
        if (strlen(res) + strlen(temp) + 2 >= cap) {
            cap *= 2;
            res = (char*)realloc(res, cap);
            if (!res) return NULL;
        }
        strcat(res, temp);
        if (curr->next) strcat(res, ",");
        curr = curr->next;
    }
    strcat(res, "]");
    return res;
}

char* serialize_int_array(int* arr, int size) {
    if (!arr || size <= 0) return strdup("[]");
    size_t cap = 1024 * 8;
    char* res = (char*)malloc(cap);
    if (!res) return NULL;
    strcpy(res, "[");
    for (int i = 0; i < size; i++) {
        char temp[32];
        sprintf(temp, "%d", arr[i]);
        if (strlen(res) + strlen(temp) + 2 >= cap) {
            cap *= 2;
            res = (char*)realloc(res, cap);
            if (!res) return NULL;
        }
        strcat(res, temp);
        if (i < size - 1) strcat(res, ",");
    }
    strcat(res, "]");
    return res;
}

struct ListNode* build_list(int n, Scanner* sc) {
    if (n <= 0) return NULL;
    struct ListNode* head = (struct ListNode*)malloc(sizeof(struct ListNode));
    head->val = next_int(sc);
    head->next = NULL;
    struct ListNode* curr = head;
    for (int i = 0; i < n - 1; ++i) {
        curr->next = (struct ListNode*)malloc(sizeof(struct ListNode));
        curr->next->val = next_int(sc);
        curr->next->next = NULL;
        curr = curr->next;
    }
    return head;
}
