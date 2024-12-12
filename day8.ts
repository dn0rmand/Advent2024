import { Day } from './tools/day.ts';
import { gcd } from './tools/numberHelper.ts';

type Antenna = {
    frequency: number;
    x: number;
    y: number;
};

class TInput {
    readonly width: number;
    readonly height: number;
    readonly antennas: Antenna[] = [];
    readonly antiNodes: Uint8Array;

    antiNodeCount: number = 0;

    constructor(data: string[]) {
        this.width = data[0].length;
        this.height = data.length;

        this.antiNodes = new Uint8Array(this.width * this.height);

        for (let y = 0; y < data.length; y++) {
            const row = data[y];
            for (let x = 0; x < row.length; x++) {
                const c = row[x];
                if (c !== '.') {
                    const p: Antenna = { frequency: c.charCodeAt(0), x, y };
                    this.antennas.push(p);
                }
            }
        }

        this.antennas.sort((a1, a2) => {
            let d = a1.frequency - a2.frequency;
            if (!d) {
                d = a1.y - a1.y;
            }
            return d ? d : a1.x - a2.x;
        });
    }

    addAntiNode(x: number, y: number): boolean {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const key = x + y * this.width;
            if (this.antiNodes[key] === 0) {
                this.antiNodes[key] = 1;
                this.antiNodeCount++;
            }
            return true;
        } else {
            return false;
        }
    }
}

export class Day8 extends Day<TInput> {
    constructor() {
        super(8);
    }

    loadInput(): TInput {
        const data = this.readDataFile();
        return new TInput(data);
    }

    part1(input: TInput): number {
        for (let i = 0; i < input.antennas.length; i++) {
            const { frequency: f1, x: x0, y: y0 } = input.antennas[i];
            for (let j = i + 1; j < input.antennas.length; j++) {
                const { frequency: f2, x: x1, y: y1 } = input.antennas[j];
                if (f2 !== f1) {
                    break;
                }
                const dx = x1 - x0;
                const dy = y1 - y0;
                input.addAntiNode(x0 - dx, y0 - dy);
                input.addAntiNode(x1 + dx, y1 + dy);
            }
        }

        return input.antiNodeCount;
    }

    part2(input: TInput): number {
        for (let i = 0; i < input.antennas.length; i++) {
            const { frequency: f1, x: x0, y: y0 } = input.antennas[i];
            for (let j = i + 1; j < input.antennas.length; j++) {
                const { frequency: f2, x: x1, y: y1 } = input.antennas[j];
                if (f2 !== f1) {
                    break;
                }

                let dx = x1 - x0;
                let dy = y1 - y0;

                const g = gcd(dx, dy);

                dx /= g;
                dy /= g;

                for (let x2 = x0 + dx, y2 = y0 + dy; ; x2 += dx, y2 += dy) {
                    if (!input.addAntiNode(x2, y2)) {
                        break;
                    }
                }
                for (let x2 = x1 - dx, y2 = y1 - dy; ; x2 -= dx, y2 -= dy) {
                    if (!input.addAntiNode(x2, y2)) {
                        break;
                    }
                }
            }
        }

        return input.antiNodeCount;
    }
}

// new Day8().execute();
