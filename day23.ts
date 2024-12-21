import { Day } from './tools/day.ts'

type TInput = string[]
export class Day23 extends Day<TInput> {
    constructor() {
        super(23)
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

// new Day23().execute();
