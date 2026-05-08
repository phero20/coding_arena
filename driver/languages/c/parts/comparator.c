bool equals_int(int a, int b, double eps, bool unordered) {
    return a == b;
}

bool equals_double(double a, double b, double eps, bool unordered) {
    return fabs(a - b) < eps;
}

bool equals_bool(bool a, bool b, double eps, bool unordered) {
    return a == b;
}

bool equals_string(char* a, char* b, double eps, bool unordered) {
    if (!a || !b) return a == b;
    return strcmp(a, b) == 0;
}
