import { Day } from './tools/day.ts'

const CYCLES = 2000

const MASK = 16777216 - 1
const MAX_SEQUENCE = 0x100000
const SEQUENCE_MASK = MAX_SEQUENCE - 1

export class Day22 extends Day<number[]> {
    visited: Uint8Array = new Uint8Array(MAX_SEQUENCE)
    sequences: Uint16Array = new Uint16Array(MAX_SEQUENCE)
    max: number = 0

    constructor() {
        super(22, 'Monkey Market')
    }

    loadInput(): number[] {
        const data = this.readDataFile()
        return data.map(v => +v)
    }

    getNextSecret(seed: number): number {
        let secret = ((seed << 6) & MASK) ^ seed
        secret = ((secret >> 5) & MASK) ^ secret
        secret = ((secret << 11) & MASK) ^ secret

        return secret
    }

    addSequence(key: number, price: number): void {
        if (!this.visited[key]) {
            this.visited[key] = 1
            this.sequences[key] += price
            this.max = Math.max(this.max, this.sequences[key])
        }
    }

    process(secret: number): void {
        this.visited.fill(0)

        let previousPrice = secret % 10

        let sequence: number = 0

        for (let i = 4; i; i--) {
            secret = this.getNextSecret(secret)
            const price = secret % 10
            sequence = ((sequence << 5) + price - previousPrice + 10) & 0xfffff
            previousPrice = price
        }

        this.addSequence(sequence, previousPrice)

        for (let count = CYCLES - 3; count; count--) {
            secret = this.getNextSecret(secret)
            const price = secret % 10
            sequence = ((sequence << 5) + price - previousPrice + 10) & SEQUENCE_MASK
            previousPrice = price
            this.addSequence(sequence, previousPrice)
        }
    }

    part1(secrets: number[]): number {
        const total = secrets.reduce((total, secret) => {
            for (let i = CYCLES; i; i--) {
                secret = this.getNextSecret(secret)
            }
            return total + secret
        }, 0)
        return total
    }

    part2(secrets: number[]): number {
        secrets.forEach(secret => this.process(secret))
        return this.max
    }
}

// new Day22().execute()
