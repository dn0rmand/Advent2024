import { Day } from './tools/day.ts';

type Equation = {
    total: number;
    values: number[];
};

type Equations = Equation[];

export class Day7 extends Day<Equations> {
    constructor() {
        super(7);
    }

    loadInput(): Equations {
        const data = this.readDataFile();
        const equations = data.map(row => {
            const [t, v] = row.split(':');
            const total = +t;
            const values = v
                .trim()
                .split(' ')
                .map(v => +v);
            const eq: Equation = { total, values };
            return eq;
        });

        return equations;
    }

    solveable(total: number, index: number, values: number[], part2: boolean): boolean {
        if (total < 0) {
            return false;
        }
        if (index === values.length - 1) {
            return total === values[0];
        }

        const v = values[values.length - 1 - index];

        if (total % v === 0 && this.solveable(total / v, index + 1, values, part2)) {
            return true;
        }

        if (part2) {
            const t = `${total}`;
            const s = `${v}`;
            if (t.endsWith(s)) {
                const total2 = +t.substring(0, t.length - s.length);
                if (this.solveable(total2, index + 1, values, true)) {
                    return true;
                }
            }
        }

        return this.solveable(total - v, index + 1, values, part2);
    }

    part1(equations: Equations): number {
        let total = 0;

        for (const equation of equations) {
            if (this.solveable(equation.total, 0, equation.values, false)) {
                total += equation.total;
            }
        }

        return total;
    }

    part2(equations: Equations): number {
        let total = 0;

        for (const equation of equations) {
            if (this.solveable(equation.total, 0, equation.values, true)) {
                total += equation.total;
            }
        }

        return total;
    }
}

// new Day7().execute();
