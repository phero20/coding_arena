#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <iomanip>
#include <chrono>
#include <stdexcept>

using namespace std;

// {{PART_SCANNER}}
// {{PART_DATA_STRUCTURES}}
// {{PART_COMPARATOR}}

// {{USER_CODE}}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    Scanner sc;
    string num_cases_str;
    if (!(cin >> num_cases_str)) return 0;
    int num_cases = stoi(num_cases_str);

    double EPS = 1e-6;
    bool UNORDERED = false;

    for (int i = 0; i < num_cases; ++i) {
        string __phase = "parse_inputs";
        try {
            // {{DRIVER_LOGIC_PLACEHOLDER}}
        } catch (const exception& e) {
            cerr << "@@ERROR@@:" << __phase << ":" << e.what() << endl;
        } catch (...) {
            cerr << "@@ERROR@@:" << __phase << ":Unknown exception" << endl;
        }
    }

    return 0;
}
