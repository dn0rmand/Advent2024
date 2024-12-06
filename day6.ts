import { Day } from './tools/day.ts';

enum Direction {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4,
}

const CHAR_TO_DIRECTION: { [key: string]: Direction } = {
    '^': Direction.UP,
    '>': Direction.RIGHT,
    v: Direction.DOWN,
    '<': Direction.LEFT,
};

type DirectionDictionary<T> = {
    [key in Direction]: T;
};

type Position = {
    x: number;
    y: number;
};

type Guard = {
    x: number;
    y: number;
    direction: Direction;
};

const NEXT_DIRECTION: DirectionDictionary<Direction> = {
    [Direction.UP]: Direction.RIGHT,
    [Direction.RIGHT]: Direction.DOWN,
    [Direction.DOWN]: Direction.LEFT,
    [Direction.LEFT]: Direction.UP,
};

const OFFSETS: DirectionDictionary<{ ox: number; oy: number }> = {
    [Direction.UP]: { ox: 0, oy: -1 },
    [Direction.RIGHT]: { ox: 1, oy: 0 },
    [Direction.DOWN]: { ox: 0, oy: 1 },
    [Direction.LEFT]: { ox: -1, oy: 0 },
};

class TInput {
    map: string[][];
    width: number;
    height: number;
    guard: Guard = { x: 0, y: 0, direction: Direction.UP };
    startingPoint: Guard;
    visited: Direction[] = [];
    visitedCount: number = 0;

    constructor(data: string[]) {
        this.map = data.map(s => s.split(''));
        this.width = data[0].length;
        this.height = data.length;

        let done = false;
        for (let x = 0; x < this.width && !done; x++) {
            for (let y = 0; y < this.height; y++) {
                const c = CHAR_TO_DIRECTION[this.map[y][x]];
                if (c !== undefined) {
                    this.setPosition(x, y, c);
                    this.guard.direction = c;
                    this.map[y][x] = '.';
                    done = true;
                    break;
                }
            }
        }

        this.startingPoint = { ...this.guard };
    }

    reset() {
        this.visited = [];
        this.guard = { ...this.startingPoint };
        this.setPosition(this.guard.x, this.guard.y, this.guard.direction);
    }

    setPosition(x: number, y: number, direction: Direction): boolean | -1 {
        const k = x + y * this.width;
        if (this.visited[k] === direction) {
            return -1; // Suck in loop
        }

        if (!this.visited[k]) {
            this.visitedCount++;
        }
        this.visited[k] = direction;
        this.guard.x = x;
        this.guard.y = y;
        return true;
    }

    move(direction: Direction): boolean | -1 {
        const { ox, oy } = OFFSETS[direction];
        const x = this.guard.x + ox;
        const y = this.guard.y + oy;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }

        if (this.map[y][x] === '.') {
            return this.setPosition(x, y, this.guard.direction);
        } else {
            this.guard.direction = NEXT_DIRECTION[this.guard.direction];
            return this.step();
        }
    }

    step(): boolean | -1 {
        return this.move(this.guard.direction);
    }

    loop(): boolean {
        while (true) {
            const r = this.step();
            if (r === -1) {
                return false;
            } else if (!r) {
                return true;
            }
        }
    }
}

export class Day6 extends Day<TInput> {
    constructor() {
        super(6);
    }

    loadInput(): TInput {
        return new TInput(this.readDataFile());
    }

    part1(input: TInput): number {
        input.loop();
        return input.visitedCount;
    }

    part2(input: TInput): number {
        const path = input.visited.reduce((a: Position[], v, i) => {
            if (v) {
                const x = i % input.width;
                const y = (i - x) / input.width;
                if (x !== input.startingPoint.x || y !== input.startingPoint.y) {
                    a.push({ x, y });
                }
            }
            return a;
        }, []);

        let total = 0;
        for (const { x, y } of path) {
            input.reset();
            input.map[y][x] = '#';
            if (!input.loop()) {
                total++;
            }
            input.map[y][x] = '.';
        }
        return total;
    }
}

// new Day6().execute();
