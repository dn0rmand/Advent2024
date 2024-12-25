import { Day } from './tools/day.ts'

const $cache: Map<number, number> = new Map()

function blink(stone: number, remaining: number): number {
    if (remaining <= 0) {
        return 1
    }

    const k = stone * 100 + remaining
    let count = $cache.get(k)
    if (count !== undefined) {
        return count
    }

    if (stone === 0) {
        count = blink(1, remaining - 1)
    } else {
        const digits = `${stone}`
        if (digits.length % 2) {
            count = blink(stone * 2024, remaining - 1)
        } else {
            const left = +digits.substring(0, digits.length / 2)
            const right = +digits.substring(digits.length / 2)

            count = blink(left, remaining - 1) + blink(right, remaining - 1)
        }
    }

    $cache.set(k, count)
    return count
}

export class Day11 extends Day<number[]> {
    constructor() {
        super(11)
    }

    loadInput(): number[] {
        return this.readDataFile()[0]
            .split(' ')
            .map(s => +s)
    }

    part1(input: number[]): number {
        return input.reduce((c, stone) => c + blink(stone, 25), 0)
    }

    part2(input: number[]): number {
        return input.reduce((c, stone) => c + blink(stone, 75), 0)
    }
}

// new Day11().execute();
