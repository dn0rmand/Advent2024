import { Day } from './tools/day.ts'

type TInput = string[]
export class Day0 extends Day<TInput> {
    constructor() {
        super(0)
    }

    loadInput(): TInput {
        const data = this.readDataFile()
        return data
    }

    part1(_: TInput): number {
        return 0
    }

    part2(_: TInput): number {
        return 0
    }
}

new Day0().execute()
