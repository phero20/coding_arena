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
            raise RuntimeError("Unexpected end of input")

    def next_int(self):
        return int(self.next())

    def next_float(self):
        return float(self.next())

    def next_bool(self):
        return self.next().lower() == "true"

def decode_string(s):
    if s == "null": return None
    if s == "-": return ""
    return base64.b64decode(s).decode("utf-8")
