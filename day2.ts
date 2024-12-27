import { Day } from './tools/day.ts'

type TInput = number[][]

export class Day2 extends Day<TInput> {
    constructor() {
        super(2, 'Red-Nosed Reports')
    }

    loadInput(): TInput {
        const data = this.readDataFile()

        const r: TInput = []

        for (const line of data) {
            const values = line.split(' ').map(v => +v)
            r.push(values)
        }

        return r
    }

    isSafe(values: number[]): boolean {
        let previous = values[0]
        const direction = values[1] - previous
        if (direction === 0) {
            return false
        }
        for (let i = 1; i < values.length; i++) {
            const current = values[i]
            const d = current - previous
            if (d === 0) {
                return false
            }
            if (d === 0 || d * direction < 0 || Math.abs(d) > 3) {
                return false
            }
            previous = current
        }
        return true
    }

    isSafe2(values: number[]): boolean {
        if (this.isSafe(values)) {
            return true
        }
        for (let i = 0; i < values.length; i++) {
            const vals = values.filter((_, idx) => idx !== i)
            if (this.isSafe(vals)) {
                return true
            }
        }
        return false
    }

    part1(input: TInput): number {
        let total = 0

        for (const values of input) {
            if (this.isSafe(values)) {
                total++
            }
        }

        return total
    }

    part2(input: TInput): number {
        let total = 0

        for (const values of input) {
            if (this.isSafe2(values)) {
                total++
            }
        }

        return total
    }
}

// new Day2().execute();
