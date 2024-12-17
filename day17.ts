import { Day } from './tools/day.ts'

enum OPCODE {
    ADV = 0,
    BXL = 1,
    BST = 2,
    JNZ = 3,
    BXC = 4,
    OUT = 5,
    BDV = 6,
    CDV = 7,
}

type TContext = {
    program: number[]
    best: number
    xor3: number
    xor5: number
}

type TInput = {
    A: number
    B: number
    C: number
}

export class Day17 extends Day<TInput> {
    program: number[] = []
    xor3: number = 0
    xor5: number = 0
    best: number = Number.MAX_SAFE_INTEGER

    constructor() {
        super(17)
    }

    loadInput(): TInput {
        const data = this.readDataFile()
        this.program = data[4]
            .substring(9)
            .split(',')
            .map(s => +s)

        this.xor3 = this.program[3]
        this.xor5 = this.program[9]

        return {
            A: +data[0].substring(12),
            B: +data[1].substring(12),
            C: +data[2].substring(12),
        }
    }

    getCombo(input: TInput, operand: number): number {
        switch (operand) {
            case 0:
            case 1:
            case 2:
            case 3:
                return operand
            case 4:
                return input.A
            case 5:
                return input.B
            case 6:
                return input.C
            case 7:
                throw 'Reserved operand'
            default:
                throw 'Invalid operand'
        }
    }

    getOutput(A: number): number {
        const b = (A & 7) ^ this.xor3
        const c0 = Math.floor(A / 2 ** b)
        const c = (c0 & 7) ^ this.xor5
        const o = b ^ c
        return o
    }

    compute(A: number): number[] {
        const output: number[] = []

        do {
            output.push(this.getOutput(A))
            A = Math.floor(A / 8)
        } while (A !== 0)

        return output
    }

    findA(A: number, index: number): number {
        if (index === 0) {
            return A
        }

        A *= 8
        if (A > this.best) {
            return this.best
        }

        const expected = this.program[index - 1]

        for (let i = 0; i < 8; i++) {
            const a = A + i
            if (a > this.best) {
                break
            }

            const v = this.getOutput(a)
            if (v === expected) {
                const aa = this.findA(a, index - 1)
                if (aa < this.best) {
                    this.best = aa
                }
            }
        }

        return this.best
    }

    part1(input: TInput): string {
        const output = this.compute(input.A)
        return output.join(',')
    }

    part2(input: TInput): string {
        const a = this.findA(0, this.program.length)
        return `${a}`
    }
}

new Day17().execute()
