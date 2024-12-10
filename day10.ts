import { Day } from './tools/day.ts';

const ZERO = '0'.charCodeAt(0);

type TPoint = {
    x: number;
    y: number;
};

class TMap {
    readonly data: Uint8Array;
    readonly width: number;
    readonly height: number;
    readonly heads: TPoint[] = [];

    constructor(input: string[]) {
        this.width = input[0].length;
        this.height = input.length;
        this.data = new Uint8Array(this.width * this.height);

        for (let y = 0; y < this.height; y++) {
            const r = input[y];
            for (let x = 0; x < this.width; x++) {
                const c = r.charCodeAt(x) - ZERO;
                this.data[x + y * this.width] = c;
                if (c === 0) {
                    this.heads.push({ x, y });
                }
            }
        }
    }

    get(x: number, y: number): number {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return Number.MAX_SAFE_INTEGER;
        }
        return this.data[x + this.width * y];
    }

    check(x: number, y: number, value: number): boolean {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.data[x + this.width * y] === value;
    }
}

class State {
    readonly x: number;
    readonly y: number;
    readonly id: number;

    rating: number;

    constructor(id: number, x: number, y: number, rating: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.rating = rating;
    }

    get key() {
        return (this.x + this.y * 100) * 500 + this.id;
    }

    moves(value: number, input: TMap): State[] {
        const result: State[] = [];

        if (input.check(this.x - 1, this.y, value)) {
            result.push(new State(this.id, this.x - 1, this.y, this.rating));
        }
        if (input.check(this.x + 1, this.y, value)) {
            result.push(new State(this.id, this.x + 1, this.y, this.rating));
        }
        if (input.check(this.x, this.y - 1, value)) {
            result.push(new State(this.id, this.x, this.y - 1, this.rating));
        }
        if (input.check(this.x, this.y + 1, value)) {
            result.push(new State(this.id, this.x, this.y + 1, this.rating));
        }

        return result;
    }
}

export class Day10 extends Day<TMap> {
    score: number = -1;
    rating: number = -1;

    constructor() {
        super(10);
    }

    loadInput(): TMap {
        const data = this.readDataFile();
        return new TMap(data);
    }

    calculateScore(input: TMap) {
        if (this.score >= 0) {
            // Already done  ... shortcut for part2
            return;
        }

        this.score = 0;
        this.rating = 0;

        let newStates: Map<number, State> = new Map();
        let states: Map<number, State> = new Map();

        let id = 0;
        for (const { x, y } of input.heads) {
            const s = new State(++id, x, y, 1);
            states.set(s.key, s);
        }

        let value = -1;
        while (states.size > 0) {
            newStates.clear();
            value++;
            for (const state of states.values()) {
                if (value === 9) {
                    this.score += 1;
                    this.rating += state.rating;
                    continue;
                }
                for (const newState of state.moves(value + 1, input)) {
                    const k = newState.key;
                    const o = newStates.get(k);
                    if (o) {
                        o.rating += newState.rating;
                    } else {
                        newStates.set(k, newState);
                    }
                }
            }

            [states, newStates] = [newStates, states];
        }
    }

    part1(input: TMap): number {
        this.calculateScore(input);
        return this.score;
    }

    part2(input: TMap): number {
        this.calculateScore(input);
        return this.rating;
    }
}

// new Day10().execute();
