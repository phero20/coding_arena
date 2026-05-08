#include <vector>
#include <string>
#include <iostream>

using namespace std;

static const string base64_chars = 
             "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
             "abcdefghijklmnopqrstuvwxyz"
             "0123456789+/";

static inline bool is_base64(unsigned char c) {
  return (isalnum(c) || (c == '+') || (c == '/'));
}

string base64_decode(string const& encoded_string) {
  int in_len = encoded_string.size();
  int i = 0;
  int j = 0;
  int in_ = 0;
  unsigned char char_array_4[4], char_array_3[3];
  string ret;

  while (in_len-- && ( encoded_string[in_] != '=') && is_base64(encoded_string[in_])) {
    char_array_4[i++] = encoded_string[in_]; in_++;
    if (i ==4) {
      for (i = 0; i <4; i++)
        char_array_4[i] = base64_chars.find(char_array_4[i]);

      char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
      char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
      char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

      for (i = 0; (i < 3); i++)
        ret += char_array_3[i];
      i = 0;
    }
  }

  if (i) {
    for (j = i; j <4; j++)
      char_array_4[j] = 0;

    for (j = 0; j <4; j++)
      char_array_4[j] = base64_chars.find(char_array_4[j]);

    char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
    char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
    char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

    for (j = 0; (j < i - 1); j++) ret += char_array_3[j];
  }

  return ret;
}

class Scanner {
public:
    string next() {
        string s;
        if (!(cin >> s)) return "";
        return s;
    }

    int next_int() {
        string s = next();
        if (s == "" || s == "null") return 0;
        try {
            return stoi(s);
        } catch (...) {
            return 0;
        }
    }

    long long next_long() {
        string s = next();
        if (s == "" || s == "null") return 0;
        try {
            return stoll(s);
        } catch (...) {
            return 0;
        }
    }

    double next_float() {
        string s = next();
        if (s == "" || s == "null") return 0.0;
        try {
            return stod(s);
        } catch (...) {
            return 0.0;
        }
    }

    bool next_bool() {
        string s = next();
        return s == "true" || s == "1";
    }
};

string decode_string(string s) {
    if (s == "null" || s == "") return "";
    return base64_decode(s);
}
