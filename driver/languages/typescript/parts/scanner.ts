import * as fs from "fs";

export class Scanner {
    private buffer: any;
    private offset: number;

    constructor() {
        this.buffer = fs.readFileSync(0);
        this.offset = 0;
    }

    nextString(): string | null {
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

    nextInt(): number {
        const s = this.nextString();
        return s === null ? 0 : parseInt(s, 10);
    }

    nextFloat(): number {
        const s = this.nextString();
        return s === null ? 0 : parseFloat(s);
    }

    nextBool(): boolean {
        const s = this.nextString();
        return s === "true" || s === "1";
    }

    nextBigInt(): any {
        const s = this.nextString();
        return s === null ? BigInt(0) : BigInt(s);
    }

    nextAny(): any {
        const s = this.nextString();
        if (s === null || s === "null") return null;
        try {
            return JSON.parse(Buffer.from(s, 'base64').toString('utf8'));
        } catch (e) {
            return s;
        }
    }
}
