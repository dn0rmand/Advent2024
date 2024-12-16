import { Day } from './tools/day.ts'

enum Direction {
    EAST = 0,
    SOUTH = 1,
    WEST = 2,
    NORTH = 3,
    MAX = 4,
}

enum Block {
    EMPTY = 0,
    WALL = 1,
}

const forwardMoves = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
]

type TPosition = {
    x: number
    y: number
}

type TMap = {
    blocks: Block[][]
    width: number
    height: number
    start: TPosition
    end: TPosition
    bestScore: number | undefined
    paths: TReindeer[] | undefined
}

class TReindeer {
    previous: TReindeer | undefined
    x: number
    y: number
    direction: Direction
    score: number

    constructor(x: number, y: number, direction: Direction, score: number, previous?: TReindeer) {
        this.x = x
        this.y = y
        this.direction = direction
        this.score = score
        this.previous = previous
    }

    create(dx: number, dy: number, direction: Direction, points: number): TReindeer {
        const [x, y] = [this.x + dx, this.y + dy]
        const previous = dx !== 0 || dy !== 0 ? this : this.previous

        return new TReindeer(x, y, direction, this.score + points, previous)
    }

    get key(): number {
        return (this.x + this.y * 150) * 10 + this.direction
    }

    moves(map: TMap): TReindeer[] {
        const states: TReindeer[] = []
        const { dx, dy } = forwardMoves[this.direction]
        const [x, y] = [this.x + dx, this.y + dy]
        if (map.blocks[y][x] === Block.EMPTY) {
            states.push(this.create(dx, dy, this.direction, 1))
        }
        states.push(this.create(0, 0, (this.direction + 1) % Direction.MAX, 1000))
        states.push(this.create(0, 0, (this.direction + Direction.MAX - 1) % Direction.MAX, 1000))
        return states
    }
}

export class Day16 extends Day<TMap> {
    constructor() {
        super(16)
    }

    loadInput(): TMap {
        const data = this.readDataFile()
        const map: TMap = {
            blocks: [],
            width: data[0].length,
            height: data.length,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
        }

        map.blocks = data.map((r, y) =>
            r.split('').map((b, x) => {
                if (b === 'S') {
                    map.start = { x, y }
                    return Block.EMPTY
                } else if (b === 'E') {
                    map.end = { x, y }
                    return Block.EMPTY
                } else {
                    return b === '#' ? Block.WALL : Block.EMPTY
                }
            })
        )

        return map
    }

    analyze(map: TMap): void {
        if (map.bestScore !== undefined) {
            return // already done
        }
        const states: TReindeer[] = []
        const visited: number[] = []

        const start = new TReindeer(map.start.x, map.start.y, Direction.EAST, 0)
        states.push(start)
        visited[start.key] = 0

        let bestScore = Number.MAX_SAFE_INTEGER
        let paths: TReindeer[] = []

        while (states.length > 0) {
            const state = states.shift()!
            const k = state.key

            if (visited[k] !== undefined && visited[k] < state.score) {
                continue // trash it
            }
            for (const newState of state.moves(map)) {
                const key = newState.key
                const o = visited[key]
                if (o !== undefined && o < newState.score) {
                    continue
                }
                visited[key] = newState.score
                if (newState.x === map.end.x && newState.y === map.end.y) {
                    if (newState.score < bestScore) {
                        bestScore = newState.score
                        paths = [newState]
                    } else if (newState.score === bestScore) {
                        paths.push(newState)
                    }
                } else {
                    states.push(newState)
                }
            }
        }

        map.bestScore = bestScore
        map.paths = paths
    }

    countSeats(paths: TReindeer[]): number {
        const visited: number[] = []

        const seats = paths.reduce((seats, state) => {
            let current: TReindeer | undefined = state
            while (current !== undefined) {
                const k = current.x + current.y * 150
                if (!visited[k]) {
                    visited[k] = 1
                    seats++
                }
                current = current.previous
            }
            return seats
        }, 0)

        return seats
    }

    part1(map: TMap): number {
        this.analyze(map)
        return map.bestScore!
    }

    part2(map: TMap): number {
        this.analyze(map)
        return this.countSeats(map.paths!)
    }
}

new Day16().execute()
