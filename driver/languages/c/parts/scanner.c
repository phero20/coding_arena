Scanner create_scanner() {
    Scanner sc;
    sc.capacity = 65536;
    sc.buffer = (char*)malloc(sc.capacity);
    sc.buffer[0] = '\0';
    return sc;
}

void destroy_scanner(Scanner* sc) {
    free(sc->buffer);
    sc->buffer = NULL;
}

/* Read one whitespace-delimited token from stdin.
   Returns pointer into sc->buffer, or NULL on EOF. */
char* next(Scanner* sc) {
    int c;
    size_t len = 0;

    /* skip leading whitespace */
    do { c = getchar(); } while (c != EOF && (c == ' ' || c == '\n' || c == '\r' || c == '\t'));
    if (c == EOF) return NULL;

    /* accumulate token */
    for (;;) {
        if (len + 2 > sc->capacity) {
            sc->capacity <<= 1;
            char* nb = (char*)realloc(sc->buffer, sc->capacity);
            if (!nb) { sc->buffer[len] = '\0'; return sc->buffer; }
            sc->buffer = nb;
        }
        sc->buffer[len++] = (char)c;
        c = getchar();
        if (c == EOF || c == ' ' || c == '\n' || c == '\r' || c == '\t') break;
    }
    sc->buffer[len] = '\0';
    return sc->buffer;
}

int        next_int  (Scanner* sc) { char* s = next(sc); return (s && strcmp(s,"null")) ? atoi(s)  : 0;   }
long long  next_long (Scanner* sc) { char* s = next(sc); return (s && strcmp(s,"null")) ? atoll(s) : 0LL; }
double     next_float(Scanner* sc) { char* s = next(sc); return (s && strcmp(s,"null")) ? atof(s)  : 0.0; }
bool       next_bool (Scanner* sc) {
    char* s = next(sc);
    return s && (strcmp(s,"true")==0 || s[0]=='1');
}

/* =========================================================
   BASE-64 DECODE  — table-driven, output malloc'd, caller frees
   ========================================================= */
static const signed char B64[256] = {
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, /* 0x00 */
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, /* 0x10 */
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63, /* 0x20  '+' '/' */
  52,53,54,55,56,57,58,59,60,61,-1,-1,-1, 0,-1,-1, /* 0x30  '0'-'9' '=' */
  -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14, /* 0x40  'A'-'O' */
  15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1, /* 0x50  'P'-'Z' */
  -1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40, /* 0x60  'a'-'o' */
  41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1, /* 0x70  'p'-'z' */
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, /* 0x80 */
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
  -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1
};

char* decode_string(char* s) {
    if (!s || s[0]=='\0') return strdup("");
    int slen = (int)strlen(s);
    /* decoded length is at most ceil(slen*3/4) + 1 */
    char* out = (char*)malloc((size_t)slen + 4);
    if (!out) return strdup("");
    int i = 0, j = 0;
    while (i + 4 <= slen) {
        unsigned char a = (unsigned char)s[i];
        unsigned char b = (unsigned char)s[i+1];
        unsigned char c = (unsigned char)s[i+2];
        unsigned char d = (unsigned char)s[i+3];
        i += 4;
        int va = B64[a], vb = B64[b], vc = B64[c], vd = B64[d];
        if (va < 0 || vb < 0) break;
        out[j++] = (char)((va << 2) | (vb >> 4));
        if (c != '=' && vc >= 0) out[j++] = (char)(((vb & 0xF) << 4) | (vc >> 2));
        if (d != '=' && vd >= 0) out[j++] = (char)(((vc & 0x3) << 6) | vd);
    }
    out[j] = '\0';
    return out;
}
