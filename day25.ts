import { Day } from './tools/day.ts'

type TInput = string[]
export class Day25 extends Day<TInput> {
    constructor() {
        super(25)
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

// new Day25().execute();
