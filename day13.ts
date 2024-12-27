import { Day } from './tools/day.ts'

type TButton = {
    x: number
    y: number
}

type TPrize = {
    x: number
    y: number
}

type TMachine = {
    A: TButton
    B: TButton
    prize: TPrize
}

type TInput = TMachine[]

export class Day13 extends Day<TInput> {
    static buttonSearch: RegExp = /(?:Button [A,B])(?:: X\+)(\d*)(?:, Y\+)(\d*)/g
    static prizeSearch: RegExp = /(?:Prize: X=)(\d*)(?:, Y=)(\d*)/g

    constructor() {
        super(13, 'Claw Contraption')
    }

    parseButton(data: string): TButton {
        const v = data.matchAll(Day13.buttonSearch).next().value!

        return {
            x: +v[1],
            y: +v[2],
        }
    }

    parsePrize(data: string): TPrize {
        const v = data.matchAll(Day13.prizeSearch).next().value!

        return {
            x: +v[1],
            y: +v[2],
        }
    }

    loadInput(): TInput {
        const data = this.readDataFile()
        const machines: TInput = []

        for (let i = 0; i < data.length; i += 4) {
            const machine = {
                A: this.parseButton(data[i]),
                B: this.parseButton(data[i + 1]),
                prize: this.parsePrize(data[i + 2]),
            }
            machines.push(machine)
        }

        return machines
    }

    solve(machine: TMachine, offset: number): number {
        const {
            A: { x: xa, y: ya },
            B: { x: xb, y: yb },
            prize: { x, y },
        } = machine

        const a = (xb * (y + offset) - yb * (x + offset)) / (ya * xb - xa * yb)
        if (Math.floor(a) !== a) {
            return 0
        }
        const b = (x + offset - xa * a) / xb
        if (Math.floor(b) !== b) {
            return 0
        }
        return 3 * a + b
    }

    part1(machines: TInput): number {
        const tokens = machines.reduce((tokens, machine) => tokens + this.solve(machine, 0), 0)

        return tokens
    }

    part2(machines: TInput): number {
        const tokens = machines.reduce((tokens, machine) => tokens + this.solve(machine, 10000000000000), 0)

        return tokens
    }
}

// new Day13().execute();
