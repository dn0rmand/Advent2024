import { Day } from './tools/day.ts'

type TInput = string[]
export class Day24 extends Day<TInput> {
    constructor() {
        super(24)
    }

    loadInput(): TInput {
        const data = this.readDataFile()
        return data
    }

    part1(input: TInput): number {
        return 0
    }

    part2(input: TInput): number {
        return 0
    }
}

// new Day24().execute();
