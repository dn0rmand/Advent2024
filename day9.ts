import { Day } from './tools/day.ts';

type Block = {
    occupied: boolean;
    moved: boolean;
    fileId: number;
    length: number;
    next: Block | null;
    previous: Block | null;
};

class FileMap {
    start: Block;
    end: Block;
    emptyBlockPerSize: Block[][] = [];

    constructor(data: string) {
        const values = data.split('').map(v => +v);

        for (let size = 0; size < 10; size++) {
            this.emptyBlockPerSize[size] = [];
        }

        this.start = {
            occupied: true,
            moved: false,
            fileId: 0,
            length: values[0],
            next: null,
            previous: null,
        };
        let fileId = 0;
        let previous = this.start;
        for (let i = 1, occupied = false; i < values.length; i++, occupied = !occupied) {
            if (occupied) {
                fileId++;
            }
            if (!occupied && values[i] === 0) {
                continue;
            }
            const b = { occupied, moved: false, fileId, length: values[i], previous, next: null };
            previous.next = b;
            previous = b;
            if (b.length > 0 && !b.occupied) {
                this.emptyBlockPerSize[b.length].push(b);
            }
        }
        this.end = previous;
        this.trim();
    }

    trim(): void {
        if (this.start === this.end) {
            return;
        }
        while (!this.end.occupied || this.end.length === 0) {
            this.end = this.end.previous!;
            this.end.next = null;
        }
    }

    remove(block: Block): void {
        const p = block.previous;
        const n = block.next;
        if (p) {
            p.next = n;
        }
        if (n) {
            n.previous = p;
        }
        block.next = block.previous = null;
        if (block === this.end) {
            this.end = p!;
            this.trim();
        }
    }

    addEmptyBlock(b: Block): void {
        if (b.length <= 0 || b.occupied) {
            return;
        }

        const list = this.emptyBlockPerSize[b.length];
        const pos = list.findIndex(s => s.fileId >= b.fileId);
        list.splice(pos, 0, b);
    }

    findEmptyBlock(e: Block): Block | undefined {
        let s1: Block | undefined;
        let target: Block = e;
        for (let size = e.length; size < this.emptyBlockPerSize.length; size++) {
            const list = this.emptyBlockPerSize[size];
            if (list.length > 0 && list[0].fileId < target.fileId) {
                s1 = list[0];
                target = s1!;
            }
        }
        if (s1) {
            this.emptyBlockPerSize[s1.length].shift();
        }
        return s1;
    }

    insertBefore(target: Block, block: Block): void {
        const p = target.previous!;
        block.previous = p;
        block.next = target;
        target.previous = block;
        p.next = block;
    }

    pack(): void {
        let s = this.start;
        while (s.next != null) {
            if (s.occupied) {
                s = s.next;
            } else {
                if (this.end.length >= s.length) {
                    s.occupied = true;
                    s.fileId = this.end.fileId;
                    this.end.length -= s.length;
                    this.trim();
                } else {
                    const e = this.end;
                    this.remove(e);
                    this.insertBefore(s, e);
                    s.length -= e.length;
                }
            }
        }
    }

    pack2(): void {
        let e = this.end;
        while (e.previous != null) {
            if (!e.occupied || e.moved) {
                e = e.previous;
            } else {
                e.moved = true; // Mark as processed
                const s = this.findEmptyBlock(e);
                if (!s) {
                    continue;
                }
                if (s.length === e.length) {
                    s.fileId = e.fileId;
                    s.moved = true;
                    s.occupied = true;
                    e.occupied = false;
                } else {
                    const newBlock = {
                        occupied: true,
                        moved: true,
                        fileId: e.fileId,
                        length: e.length,
                        next: null,
                        previous: null,
                    };
                    this.insertBefore(s, newBlock);
                    e.occupied = false;
                    s.length -= e.length;
                    this.addEmptyBlock(s);
                }
            }
        }
    }

    get checksum(): number {
        let result = 0;
        let pos = 0;
        for (let s = this.start; s != null; s = s.next!) {
            if (s.occupied && s.fileId !== 0) {
                result += s.fileId * (s.length * pos + (s.length * (s.length - 1)) / 2);
            }
            pos += s.length;
        }
        return result;
    }
}

export class Day9 extends Day<string> {
    constructor() {
        super(9);
    }

    loadInput(): string {
        const data = this.readDataFile()[0];
        return data;
    }

    part1(input: string): number {
        const filemap = new FileMap(input);
        filemap.pack();
        return filemap.checksum;
    }

    part2(input: string): number {
        const filemap = new FileMap(input);
        filemap.pack2();
        return filemap.checksum;
    }
}

// new Day9().execute();
