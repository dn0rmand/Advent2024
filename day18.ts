import { Day } from './tools/day.ts'

type TByte = {
    x: number
    y: number
}

type State = {
    x: number
    y: number
    steps: number
}

type TInput = {
    map: number[][]
    bytes: TByte[]
    width: number
    height: number
}

export class Day18 extends Day<TInput> {
    constructor() {
        super(18)
    }

    clearMap(input: TInput): void {
        for (let y = 0; y < input.height; y++) {
            for (let x = 0; x < input.width; x++) {
                input.map[y][x] = 0
            }
        }
    }

    loadInput(): TInput {
        const data = this.readDataFile()

        const input: TInput = {
            map: [],
            bytes: [],
            width: 0,
            height: 0,
        }

        for (const row of data) {
            const [x, y] = row.split(',').map(v => +v)
            input.bytes.push({ x, y })
            input.width = Math.max(input.width, x + 1)
            input.height = Math.max(input.width, y + 1)
        }

        input.map = new Array(input.height)
        for (let y = 0; y < input.height; y++) {
            input.map[y] = new Array(input.width)
        }

        return input
    }

    findPath(input: TInput): number {
        const states: State[] = [{ x: 0, y: 0, steps: 0 }]
        const visited = new Uint8Array(input.width * input.height)
        visited[0] = 1

        let best = Number.MAX_SAFE_INTEGER

        while (states.length > 0) {
            const { x, y, steps } = states.shift()!
            if (steps + 1 >= best) {
                continue
            }
            for (const [x0, y0] of [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1],
            ]) {
                if (x0 < 0 || y0 < 0 || x0 >= input.width || y0 >= input.height) {
                    continue
                }
                const key = x0 + y0 * input.width
                if (input.map[y][x] !== 0) {
                    continue
                }
                if (visited[key] && visited[key] <= steps + 1) {
                    continue
                }
                if (x0 + 1 === input.width && y0 + 1 === input.height) {
                    best = Math.min(best, steps + 1)
                } else {
                    visited[key] = steps + 1
                    states.push({ x: x0, y: y0, steps: steps + 1 })
                }
            }
        }
        return best
    }

    LIMIT = 1024

    quickSearch(input: TInput, bytes: TByte[]): TByte {
        let min = 1024
        let max = bytes.length - 1
        let offset = 0
        let fallen = -1
        while (min < max) {
            const middle = Math.floor((min + max) / 2)

            while (fallen > middle) {
                const { x, y } = bytes[fallen--]
                input.map[y][x] = 0
            }
            while (fallen < middle) {
                const { x, y } = bytes[++fallen]
                input.map[y][x] = 1
            }

            // get path
            if (this.findPath(input) !== Number.MAX_SAFE_INTEGER) {
                min = middle + 1
                offset = 0
            } else {
                max = middle - 1
                offset = 1
            }
        }

        return bytes[max + offset]
    }

    part1(input: TInput): number {
        this.clearMap(input)
        for (let i = 0; i < this.LIMIT; i++) {
            const { x, y } = input.bytes[i]
            input.map[y][x] = 1
        }
        return this.findPath(input)
    }

    part2(input: TInput): string {
        this.clearMap(input)
        const { x, y } = this.quickSearch(input, input.bytes)
        return `${x},${y}`
    }
}

new Day18().execute()
