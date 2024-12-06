import { Day } from './tools/day.ts';

type LETTER = 'X' | 'M' | 'A' | 'S';

const XMAS = {
    X: 0,
    M: 1,
    A: 2,
    S: 3,
};

class TMap {
    data: LETTER[][];
    AIndexes: number[] = [];
    XIndexes: number[] = [];
    width: number;
    height: number;

    constructor(input: string[]) {
        this.width = input[0].length;
        this.height = input.length;
        this.data = input.map((s, y) =>
            s.split('').map((c: string, x: number): LETTER => {
                switch (c) {
                    case 'X':
                        this.XIndexes.push(y * this.width + x);
                        return 'X';
                    case 'M':
                        return 'M';
                    case 'A':
                        this.AIndexes.push(y * this.width + x);
                        return 'A';
                    case 'S':
                        return 'S';
                    default:
                        throw 'Invalid data';
                }
            })
        );
    }

    forEach(letter: number, callback: (x: number, y: number) => number): number {
        let total = 0;
        const indexes = letter === XMAS.A ? this.AIndexes : this.XIndexes;

        for (const xy of indexes) {
            const x = xy % this.width;
            const y = (xy - x) / this.width;
            total += callback(x, y);
        }

        return total;
    }

    search(x: number, y: number, letter: number, ix: number, iy: number): number {
        while (letter != XMAS.S) {
            x += ix;
            y += iy;
            letter += 1;
            if (this.get(x, y) !== letter) {
                return 0;
            }
        }
        return 1;
    }

    get(x: number, y: number): number {
        if (y >= 0 && y < this.height) {
            if (x >= 0 && x < this.width) {
                const letter = this.data[y][x];
                return XMAS[letter];
            }
        }
        return -1;
    }
}

export class Day4 extends Day<TMap> {
    constructor() {
        super(4);
    }

    loadInput(): TMap {
        const data = this.readDataFile();

        return new TMap(data);
    }

    part1(input: TMap): number {
        return input.forEach(XMAS.X, (x: number, y: number): number => {
            return (
                input.search(x, y, XMAS.X, 0, 1) +
                input.search(x, y, XMAS.X, 1, 0) +
                input.search(x, y, XMAS.X, 0, -1) +
                input.search(x, y, XMAS.X, -1, 0) +
                input.search(x, y, XMAS.X, -1, -1) +
                input.search(x, y, XMAS.X, -1, 1) +
                input.search(x, y, XMAS.X, 1, -1) +
                input.search(x, y, XMAS.X, 1, 1)
            );
        });
    }

    part2(input: TMap): number {
        return input.forEach(XMAS.A, (x: number, y: number): number => {
            if (
                (input.get(x - 1, y - 1) === XMAS.M && input.get(x + 1, y + 1) === XMAS.S) ||
                (input.get(x - 1, y - 1) === XMAS.S && input.get(x + 1, y + 1) === XMAS.M)
            ) {
                if (
                    (input.get(x - 1, y + 1) === XMAS.M && input.get(x + 1, y - 1) === XMAS.S) ||
                    (input.get(x - 1, y + 1) === XMAS.S && input.get(x + 1, y - 1) === XMAS.M)
                ) {
                    return 1;
                }
            }
            return 0;
        });
    }
}

// new Day4().execute();
