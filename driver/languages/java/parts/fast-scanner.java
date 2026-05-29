    // --- FAST INPUT ---
    private static final class FastScanner {
        private final InputStream in;
        private final byte[] buffer = new byte[1 << 16];
        private int ptr = 0, len = 0;

        FastScanner(InputStream in) { this.in = in; }

        private int read() throws IOException {
            if (ptr >= len) {
                len = in.read(buffer);
                ptr = 0;
                if (len <= 0) return -1;
            }
            return buffer[ptr++];
        }

        private void skipWhitespace() throws IOException {
            int c;
            while ((c = read()) != -1) {
                if (!Character.isWhitespace(c)) {
                    ptr--;
                    return;
                }
            }
        }

        String next() throws IOException {
            skipWhitespace();
            StringBuilder sb = new StringBuilder();
            int c;
            while ((c = read()) != -1 && !Character.isWhitespace(c)) {
                sb.append((char) c);
            }
            if (sb.length() == 0) throw new NoSuchElementException("End of input");
            return sb.toString();
        }
 
        int nextInt() throws IOException {
            return Integer.parseInt(next());
        }
 
        long nextLong() throws IOException {
            return Long.parseLong(next());
        }
 
        double nextDouble() throws IOException {
            return Double.parseDouble(next());
        }
 
        float nextFloat() throws IOException {
            return Float.parseFloat(next());
        }

        boolean nextBoolean() throws IOException {
            String s = next();
            return s.equalsIgnoreCase("true") || s.equals("1");
        }
    }
