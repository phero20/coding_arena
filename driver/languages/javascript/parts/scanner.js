class Scanner {
    constructor() {
        this.buffer = fs.readFileSync(0);
        this.offset = 0;
    }

    nextToken() {
        while (this.offset < this.buffer.length && this.buffer[this.offset] <= 32) {
            this.offset++;
        }
        if (this.offset >= this.buffer.length) return null;
        let start = this.offset;
        while (this.offset < this.buffer.length && this.buffer[this.offset] > 32) {
            this.offset++;
        }
        return this.buffer.toString('utf8', start, this.offset);
    }

    nextString() {
        const s = this.nextToken();
        if (s === "-" || s === "" || s === null) return "";
        if (s === "null") return null;
        try {
            return Buffer.from(s, 'base64').toString('utf8');
        } catch (e) {
            return s;
        }
    }

    nextInt() {
        const s = this.nextToken();
        return s === null ? 0 : parseInt(s, 10);
    }

    nextFloat() {
        const s = this.nextToken();
        return s === null ? 0 : parseFloat(s);
    }

    nextBool() {
        const s = this.nextToken();
        return s === "true" || s === "1";
    }

    nextBigInt() {
        const s = this.nextToken();
        return s === null ? 0n : BigInt(s);
    }

    nextAny() {
        const s = this.nextToken();
        if (s === null || s === "null") return null;
        if (s === "-") return "";
        try {
            return JSON.parse(Buffer.from(s, 'base64').toString('utf8'));
        } catch (e) {
            return s;
        }
    }
}
