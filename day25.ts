import { Day } from './tools/day.ts'

export class Day25 extends Day<void> {
    locks: number[][] = []
    keys: number[][] = []

    constructor() {
        super(25)
    }

    loadInput(): void {
        const data = this.readDataFile()

        for (let i = 0; i < data.length; i += 8) {
            const values = []
            for (let x = 0; x < 5; x++) {
                let h = -1
                for (let y = i; y < i + 7; y++) {
                    if (data[y][x] === '#') {
                        h++
                    }
                }
                values.push(h)
            }
            if (data[i] === '.....') {
                // key
                this.keys.push(values)
            } else if (data[i] === '#####') {
                // Lock
                this.locks.push(values)
            } else {
                throw 'Syntax error'
            }
        }
    }

    fits(lock: number[], key: number[]): number {
        return lock.some((v, i) => v + key[i] > 5) ? 0 : 1
    }

    part1(): number {
        const total = this.locks.reduce((a, l) => a + this.keys.reduce((a, k) => a + this.fits(l, k), 0), 0)
        return total
    }

    part2(): string {
        return 'Merry Christmas'
    }
}

// new Day25().execute()
