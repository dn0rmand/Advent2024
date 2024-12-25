import { Day } from './tools/day.ts'

type TAction = (i1: number, i2: number) => number

const actions: { [key: string]: TAction } = {
    OR: (i1: number, i2: number) => i1 | i2,
    AND: (i1: number, i2: number) => i1 & i2,
    XOR: (i1: number, i2: number) => i1 ^ i2,
}

type TGate = {
    input: string[]
    output: string
    action: string
    verified: boolean
}

export class Day24 extends Day<void> {
    gates: TGate[] = []
    names: string[] = []
    xNames: string[] = []
    yNames: string[] = []
    zNames: string[] = []
    swaps: string[] = []

    gatesByOutput: { [key: string]: TGate } = {}
    values: { [key: string]: number } = {}
    cache: { [key: string]: number } = {}

    constructor() {
        super(24)
    }

    loadInput(): void {
        const data = this.readDataFile()
        const parser: RegExp = /(.+) (XOR|OR|AND) (.+) -> (.+)/g

        for (const row of data) {
            if (!row) {
                continue
            }
            const [gateName, value] = row.split(': ')
            if (value !== undefined) {
                this.values[gateName] = +value
            } else {
                for (const match of row.matchAll(parser) ?? []) {
                    const i1 = match[1]
                    const op = match[2]
                    const i2 = match[3]
                    const out = match[4]

                    // deno-lint-ignore no-self-assign
                    this.values[i1] = this.values[i1]
                    // deno-lint-ignore no-self-assign
                    this.values[i2] = this.values[i2]
                    // deno-lint-ignore no-self-assign
                    this.values[out] = this.values[out]

                    const gate: TGate = {
                        action: op,
                        input: [i1, i2].sort((a, b) => a.localeCompare(b)),
                        output: out,
                        verified: false,
                    }
                    this.gatesByOutput[out] = gate
                    this.gates.push(gate)
                }
            }
        }
        this.names = Object.keys(this.values).sort((a, b) => a.localeCompare(b))

        this.xNames = this.names.filter(n => n[0] === 'x')
        this.yNames = this.names.filter(n => n[0] === 'y')
        this.zNames = this.names.filter(n => n[0] === 'z')
    }

    evaluate(output: string): number {
        let value = this.values[output] ?? this.cache[output]

        if (value === undefined) {
            const gate = this.gatesByOutput[output]!
            const [v1, v2] = gate.input.map(i => this.evaluate(i))

            value = actions[gate.action](v1, v2)
            this.cache[output] = value
        }
        return value
    }

    getValue(outputs: string[]): number {
        let total = 0

        for (let i = outputs.length; i; i--) {
            total = total * 2 + this.evaluate(outputs[i - 1])
        }

        return total
    }

    part1(): number {
        return this.getValue(this.zNames)
    }

    isXY(output: string, bit: number, action: string): boolean {
        const gate = this.gatesByOutput[output]

        if (gate?.action !== action) {
            return false
        }

        if (gate.input[0] !== this.xNames[bit] || gate.input[1] !== this.yNames[bit]) {
            return false
        }

        return true
    }

    isPreviousAnd(gate: string, previous: TGate): boolean {
        const g = this.gatesByOutput[gate]

        if (g.action !== 'AND') {
            return false
        }
        return g.input[0] === previous.input[0] && g.input[1] === previous.input[1]
    }

    findSwap(bit: number, output: string): string[] | undefined {
        const options = this.names.filter(v => this.gatesByOutput[v] && !this.gatesByOutput[v].verified)

        const zGate = this.gatesByOutput[output]
        if (zGate.action !== 'XOR') {
            const possibles = options.filter(v => this.gatesByOutput[v].action === 'XOR')

            const swap = possibles.filter(v => {
                const g = this.gatesByOutput[v]
                if (this.isXY(g.input[0], bit, 'XOR')) {
                    return true
                } else if (this.isXY(g.input[1], bit, 'XOR')) {
                    return true
                } else {
                    return false
                }
            })
            if (swap.length === 1) {
                return [output, swap[0]]
            }
        } else {
            const inputs = options.filter(v => this.isXY(v, bit, 'XOR'))
            if (inputs.length === 1) {
                if (this.gatesByOutput[zGate.input[0]].action !== 'OR') {
                    return [inputs[0], zGate.input[0]]
                } else if (this.gatesByOutput[zGate.input[1]].action !== 'OR') {
                    return [inputs[0], zGate.input[1]]
                }
            }
        }

        throw 'Error: No swap found'
    }

    isValid(bit: number, output: string, previous: TGate): boolean {
        const zGate = this.gatesByOutput[output]
        if (zGate.action !== 'XOR') {
            return false
        }

        let other: string

        if (this.isXY(zGate.input[0], bit, 'XOR')) {
            other = zGate.input[1]
        } else if (this.isXY(zGate.input[1], bit, 'XOR')) {
            other = zGate.input[0]
        } else {
            return false
        }

        const g = this.gatesByOutput[other]

        if (g.action === 'OR') {
            if (this.isXY(g.input[0], bit - 1, 'AND')) {
                return this.isPreviousAnd(g.input[1], previous)
            } else if (this.isXY(g.input[1], bit - 1, 'AND')) {
                return this.isPreviousAnd(g.input[0], previous)
            } else {
                return false
            }
        } else if (g.action === 'AND') {
            return bit === 1 && this.isXY(other, 0, 'AND')
        } else {
            return false
        }
    }

    isLastValid(bit: number, output: string, previous: TGate): boolean {
        const g = this.gatesByOutput[output]

        if (g.action !== 'OR') {
            return false
        } else if (this.isXY(g.input[0], bit - 1, 'AND')) {
            return this.isPreviousAnd(g.input[1], previous)
        } else if (this.isXY(g.input[1], bit - 1, 'AND')) {
            return this.isPreviousAnd(g.input[0], previous)
        } else {
            return false
        }
    }

    isFirstValid(output: string): boolean {
        return this.isXY(output, 0, 'XOR')
    }

    markAsValid(output: string) {
        const gate = this.gatesByOutput[output]
        if (gate && !gate.verified) {
            gate.verified = true
            this.markAsValid(gate.input[0])
            this.markAsValid(gate.input[1])
        }
    }

    doSwap(o1: string, o2: string): void {
        if (o1 === o2) {
            throw "That's not a valid swap"
        }
        if (this.swaps.includes(o1) || this.swaps.includes(o2)) {
            throw 'Duplicate swap detected'
        }
        this.swaps.push(o1, o2)
        const g1 = this.gatesByOutput[o1]
        const g2 = this.gatesByOutput[o2]
        this.gatesByOutput[o1] = g2
        this.gatesByOutput[o2] = g1
    }

    validateAddition() {
        this.cache = {}
        const x = this.getValue(this.xNames)
        const y = this.getValue(this.yNames)
        const z = this.getValue(this.zNames)
        if (z !== x + y) {
            throw 'Still incorrect'
        }
    }

    part2(): string {
        if (!this.isFirstValid(this.zNames[0])) {
            throw 'Input not supported as of now'
        }
        this.markAsValid(this.zNames[0])
        let previous: TGate = this.gatesByOutput[this.zNames[0]]

        const last = this.zNames.length - 1
        for (let bit = 1; bit <= last; bit++) {
            const output = this.zNames[bit]
            if (bit === last) {
                if (!this.isLastValid(bit, output, previous)) {
                    throw 'Input not supported as of now'
                }
            } else if (!this.isValid(bit, output, previous)) {
                const swap = this.findSwap(bit, output)
                if (!swap) {
                    throw 'Error: No swap found'
                }
                this.doSwap(swap[0], swap[1])
                if (!this.isValid(bit, output, previous)) {
                    throw "Swap didn't work"
                }
            }

            this.markAsValid(output)
            previous = this.gatesByOutput[output]
        }

        if (this.swaps.length !== 8) {
            throw 'Error: Only 4 swaps allowed'
        }

        // this.validateAddition()

        this.swaps.sort((a, b) => a.localeCompare(b))
        return this.swaps.join(',')
    }
}

// new Day24().execute()
