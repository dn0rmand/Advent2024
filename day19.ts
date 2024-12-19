import { Day } from './tools/day.ts'

type TInput = {
    patterns: string[]
    designs: string[]
}

export class Day19 extends Day<TInput> {
    memoize: Map<string, number> = new Map()

    constructor() {
        super(19)
    }

    loadInput(): TInput {
        const data = this.readDataFile()
        const patterns: string[] = data[0].split(',').map(p => p.trim())
        const designs: string[] = data.filter((_, i) => i > 1)

        return {
            patterns,
            designs,
        }
    }

    canEnd(patterns: string[], design: string): boolean {
        const f = patterns.some(p => design.endsWith(p))
        return f
    }

    findDesign(patterns: string[], design: string): number {
        if (design.length === 0) {
            return 1
        }

        let result = this.memoize.get(design)
        if (result !== undefined) {
            return result
        }

        result = 0

        for (const pattern of patterns.filter(p => design.startsWith(p))) {
            const d = design.substring(pattern.length)
            result += this.findDesign(patterns, d)
        }

        this.memoize.set(design, result)
        return result
    }

    part1(input: TInput): number {
        let possible = 0
        for (let i = 0; i < input.designs.length; i++) {
            const design = input.designs[i]
            const patterns = input.patterns.filter(p => design.indexOf(p) >= 0)
            if (!this.canEnd(patterns, design)) {
                this.memoize.set(design, 0)
            } else if (this.findDesign(patterns, design) > 0) {
                possible++
            }
        }
        return possible
    }

    part2(input: TInput): number {
        let total = 0
        for (let i = 0; i < input.designs.length; i++) {
            const design = input.designs[i]
            total += this.findDesign(input.patterns, design)
        }
        return total
    }
}

// new Day19().execute()
