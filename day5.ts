import { Day } from './tools/day.ts'

type TInput = {
    rules: number[][]
    updates: number[][]
}

export class Day5 extends Day<TInput> {
    unsorted: number[][] | undefined

    constructor() {
        super(5)
    }

    loadInput(): TInput {
        const data = this.readDataFile()

        const input: TInput = {
            rules: [],
            updates: [],
        }

        let rules = true

        for (const line of data) {
            if (line.length === 0) {
                rules = false
            } else if (rules) {
                const [left, right] = line.split('|').map(v => +v)
                input.rules[left] ??= []
                input.rules[right] ??= []
                input.rules[left].push(right)
            } else {
                const update = line.split(',').map(v => +v)
                input.updates.push(update)
            }
        }

        return input
    }

    compare(input: TInput, a: number, b: number): number {
        if (input.rules[a].includes(b)) {
            return -1
        } else if (input.rules[b].includes(a)) {
            return 1
        } else {
            return 0
        }
    }

    sorted(input: TInput, update: number[]): boolean {
        const sorted = [...update].sort((a, b) => this.compare(input, a, b))
        for (let i = 0; i < update.length; i++) {
            if (update[i] != sorted[i]) {
                return false
            }
        }
        return true
    }

    getUnsorted(input: TInput): number[][] {
        if (this.unsorted === undefined) {
            this.unsorted = input.updates.filter(update => !this.sorted(input, update))
        }
        return this.unsorted
    }

    part1(input: TInput): number {
        this.unsorted = []
        let total = 0
        for (const update of input.updates) {
            if (this.sorted(input, update)) {
                total += update[(update.length - 1) / 2]
            } else {
                this.unsorted.push(update)
            }
        }
        return total
    }

    part2(input: TInput): number {
        let total = 0
        for (const update of this.getUnsorted(input)) {
            update.sort((a, b) => this.compare(input, a, b))
            total += update[(update.length - 1) / 2]
        }
        return total
    }
}

// new Day5().execute();
