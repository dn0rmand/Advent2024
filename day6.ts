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
    readonly map: Uint8Array;
    readonly width: number;
    readonly height: number;
    readonly startingPoint: Guard;

    path: Position[] | undefined = [];
    guard: Guard = { x: 0, y: 0, direction: Direction.UP };
    visited: Direction[] = [];

    constructor(data: string[]) {
        this.map = new Uint8Array(
            data
                .join('')
                .split('')
                .map(c => (c === '#' ? 1 : 0))
        );
        this.width = data[0].length;
        this.height = data.length;

        let done = false;
        for (let x = 0; x < this.width && !done; x++) {
            for (let y = 0; y < this.height; y++) {
                const c = CHAR_TO_DIRECTION[data[y][x]];
                if (c !== undefined) {
                    this.setPosition(x, y, c);
                    this.guard.direction = c;
                    done = true;
                    break;
                }
            }
        }

        this.startingPoint = { ...this.guard };
        this.path = [];
    }

    set(x: number, y: number, c: number): void {
        this.map[x + y * this.width] = c;
    }

    get(x: number, y: number): number {
        return this.map[x + y * this.width];
    }

    checkPoint(): { visited: Direction[]; guard: Guard } {
        return {
            visited: [...this.visited],
            guard: { ...this.guard },
        };
    }

    restore(visited: Direction[], guard: Guard): void {
        this.visited = visited;
        this.guard = guard;
    }

    reset() {
        this.visited = [];
        this.guard = { ...this.startingPoint };
        this.setPosition(this.guard.x, this.guard.y, this.guard.direction);
    }

    setPosition(x: number, y: number, direction: Direction): boolean | -1 {
        const k = x + y * this.width;

        if (this.visited[k] === direction) {
            return -1; // Stuck in loop
        }

        if (this.path && this.visited[k] === undefined) {
            this.path.push({ x, y });
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

        if (this.get(x, y) === 0) {
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
        return input.path!.length + 1;
    }

    part2(input: TInput): number {
        const path = input.path!;

        input.path = undefined;

        let total = 0;
        input.reset();
        for (const { x, y } of path) {
            const { visited, guard } = input.checkPoint();
            input.set(x, y, 1);
            if (!input.loop()) {
                total++;
            }
            input.set(x, y, 0);
            input.restore(visited, guard);
            input.step();
        }
        return total;
    }
}

new Day6().execute();
