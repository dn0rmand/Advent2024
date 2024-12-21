import { Day } from './tools/day.ts'

type TInput = string[]
export class Day21 extends Day<TInput> {
    constructor() {
        super(21)
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

// new Day21().execute();
