#include <cmath>

class DeepComparator {
public:
    template<typename T>
    static bool equals(const T& a, const T& b, double eps, bool unordered) {
        return a == b;
    }

    static bool equals(double a, double b, double eps, bool unordered) {
        return abs(a - b) < eps;
    }

    template<typename T>
    static bool equals(vector<T> a, vector<T> b, double eps, bool unordered) {
        if (a.size() != b.size()) return false;
        if (unordered) {
            // Very basic unordered check for small arrays
            // For large arrays, a more robust map-based approach would be needed
            sort(a.begin(), a.end());
            sort(b.begin(), b.end());
        }
        for (size_t i = 0; i < a.size(); ++i) {
            if (!equals(a[i], b[i], eps, false)) return false;
        }
        return true;
    }
};
