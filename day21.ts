import { Day } from './tools/day.ts'

type TCodes = string[]

const doorPad: { [key: string]: { x: number; y: number } } = {
    ['7']: { x: 0, y: 0 },
    ['8']: { x: 1, y: 0 },
    ['9']: { x: 2, y: 0 },

    ['4']: { x: 0, y: 1 },
    ['5']: { x: 1, y: 1 },
    ['6']: { x: 2, y: 1 },

    ['1']: { x: 0, y: 2 },
    ['2']: { x: 1, y: 2 },
    ['3']: { x: 2, y: 2 },

    ['0']: { x: 1, y: 3 },
    ['A']: { x: 2, y: 3 },
}

const robotPad: { [key: string]: { x: number; y: number } } = {
    ['^']: { x: 1, y: 0 },
    ['A']: { x: 2, y: 0 },

    ['<']: { x: 0, y: 1 },
    ['v']: { x: 1, y: 1 },
    ['>']: { x: 2, y: 1 },
}

export class Day21 extends Day<TCodes> {
    constructor() {
        super(21, 'Keypad Conundrum')
    }

    loadInput(): TCodes {
        const data = this.readDataFile()
        return data
    }

    getDoorPath(from: string, to: string): string[] {
        let pathX = ''
        let pathY = ''

        const { x: x0, y: y0 } = doorPad[from]
        const { x: x1, y: y1 } = doorPad[to]

        const dx = x1 - x0
        const dy = y1 - y0

        if (dx < 0) {
            pathX = '<'.repeat(-dx)
        } else if (dx > 0) {
            pathX = '>'.repeat(dx)
        }

        if (dy < 0) {
            pathY = '^'.repeat(-dy)
        } else if (dy > 0) {
            pathY = 'v'.repeat(dy)
        }

        const paths: { [key: string]: boolean } = {}

        if (x0 + dx !== 0 || y0 !== 3) {
            paths[pathX + pathY + 'A'] = true
        }
        if (y0 + dy !== 3 || x0 !== 0) {
            paths[pathY + pathX + 'A'] = true
        }

        return Object.keys(paths)
    }

    getRobotPath(from: string, to: string): string[] {
        let pathX = ''
        let pathY = ''

        const { x: x0, y: y0 } = robotPad[from]
        const { x: x1, y: y1 } = robotPad[to]

        const dx = x1 - x0
        const dy = y1 - y0

        if (dx < 0) {
            pathX = '<'.repeat(-dx)
        } else if (dx > 0) {
            pathX = '>'.repeat(dx)
        }

        if (dy < 0) {
            pathY = '^'.repeat(-dy)
        } else if (dy > 0) {
            pathY = 'v'.repeat(dy)
        }

        const paths: { [key: string]: boolean } = {}

        if (x0 + dx !== 0 || y0 !== 0) {
            paths[pathX + pathY + 'A'] = true
        }
        if (y0 + dy !== 0 || x0 !== 0) {
            paths[pathY + pathX + 'A'] = true
        }

        return Object.keys(paths)
    }

    $memoize: Map<string, number>[] = []

    getMemoize(path: string, robots: number): number | undefined {
        const m = this.$memoize[robots]
        if (m === undefined) {
            return undefined
        }
        return m.get(path)
    }

    setMemoize(path: string, robots: number, value: number): void {
        this.$memoize[robots] ??= new Map()
        this.$memoize[robots].set(path, value)
    }

    getRobotCost(path: string, robots: number): number {
        if (robots === 0) {
            return path.length
        }

        let total = this.getMemoize(path, robots)
        if (total !== undefined) {
            return total
        }
        total = 0

        let current = 'A'
        for (const key of path) {
            const paths = this.getRobotPath(current, key)
            current = key
            let best = Number.MAX_SAFE_INTEGER
            for (const p of paths) {
                const c = this.getRobotCost(p, robots - 1)
                if (c < best) {
                    best = c
                }
            }
            total += best
        }

        this.setMemoize(path, robots, total)

        return total
    }

    getCodeCost(code: string, robots: number): number {
        let current = 'A'
        let total = 0
        for (const digit of code) {
            const paths = this.getDoorPath(current, digit)
            current = digit
            let best = Number.MAX_SAFE_INTEGER
            for (const path of paths) {
                const c = this.getRobotCost(path, robots)
                if (c < best) {
                    best = c
                }
            }
            total += best
        }
        return total
    }

    part1(codes: TCodes): number {
        let total = 0
        for (const code of codes) {
            const codeValue = +code.substring(0, 3)
            const length = this.getCodeCost(code, 2)
            total += codeValue * length
        }
        return total
    }

    part2(codes: TCodes): number {
        let total = 0
        for (const code of codes) {
            const codeValue = +code.substring(0, 3)
            const length = this.getCodeCost(code, 25)
            total += codeValue * length
        }
        return total
    }
}

// new Day21().execute()
