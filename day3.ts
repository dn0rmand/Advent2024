import { Day } from './tools/day.ts'

export class Day3 extends Day<string> {
    constructor() {
        super(3, 'Mull It Over')
    }

    loadInput(): string {
        const data = this.readDataFile()
        return data.join(' ')
    }

    processLine(line: string): number {
        const r: RegExp = /(?:mul\()(\d*),(\d*)(?:\))/g
        let total = 0
        for (const match of line.matchAll(r) ?? []) {
            total += +match[1] * +match[2]
        }
        return total
    }

    part1(input: string): number {
        return this.processLine(input)
    }

    part2(input: string): number {
        let total = 0

        let start = 0
        while (start < input.length) {
            const end = input.indexOf("don't()", start)
            if (end < 0) {
                const line = input.substring(start, input.length)
                total += this.processLine(line)
                start = input.length
            } else {
                const line = input.substring(start, end)
                total += this.processLine(line)
                start = input.indexOf('do()', end)
                if (start < 0) {
                    start = input.length
                }
            }
        }

        return total
    }
}

// new Day3().execute();
