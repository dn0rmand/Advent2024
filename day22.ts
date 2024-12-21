import { Day } from './tools/day.ts'

type TInput = string[]
export class Day22 extends Day<TInput> {
    constructor() {
        super(22)
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

// new Day22().execute();
