import sys
import base64

class Scanner:
    def __init__(self):
        self.tokens = self._gen_tokens()
        self.current = None

    def _gen_tokens(self):
        for line in sys.stdin:
            for token in line.split():
                yield token

    def next(self):
        try:
            return next(self.tokens)
        except StopIteration:
            return None

    def next_int(self):
        val = self.next()
        return int(val) if val is not None else 0

    def next_float(self):
        val = self.next()
        return float(val) if val is not None else 0.0

    def next_bool(self):
        val = self.next()
        if val is None: return False
        return val.lower() == "true"

def decode_string(s):
    if s == "null": return None
    return base64.b64decode(s).decode("utf-8")
