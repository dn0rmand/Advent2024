import { Day } from './tools/day.ts'

type TPlot = {
    type: string
    key: number
    area: number
    perimeter: number
}

type TGarden = {
    map: string[][]
    width: number
    height: number
    visited: Uint8Array
    costs: Uint8Array
    plots?: TPlot[]
}

function get(context: TGarden, x: number, y: number): string {
    if (x < 0 || y < 0 || x >= context.width || y >= context.height) {
        return ' '
    }
    return context.map[y][x]
}

export class Day12 extends Day<TGarden> {
    constructor() {
        super(12, 'Garden Groups')
    }

    buildPlot(context: TGarden, plot: TPlot, x: number, y: number): number {
        const included = get(context, x, y) === plot.type
        if (!included) {
            return 0
        }
        const key = x + y * context.width
        if (context.visited[key]) {
            return 1
        }

        context.visited[key] = 1

        const cost =
            4 -
            this.buildPlot(context, plot, x - 1, y) -
            this.buildPlot(context, plot, x, y - 1) -
            this.buildPlot(context, plot, x + 1, y) -
            this.buildPlot(context, plot, x, y + 1)

        context.costs[key] = cost

        plot.area++
        plot.perimeter += cost

        return 1
    }

    extractPlots(context: TGarden): TPlot[] {
        context.visited.fill(0)
        const plots: TPlot[] = []

        let key = 0
        for (let y = 0; y < context.height; y++) {
            for (let x = 0; x < context.width; x++, key++) {
                if (!context.visited[key]) {
                    const plot: TPlot = {
                        type: get(context, x, y),
                        key,
                        area: 0,
                        perimeter: 0,
                    }
                    plots.push(plot)
                    this.buildPlot(context, plot, x, y)
                }
            }
        }

        return plots
    }

    remove(context: TGarden, plot: TPlot, x: number, y: number) {
        if (!context.visited[x + y * context.width]) {
            plot.perimeter--
        }
    }

    inline(context: TGarden, plot: TPlot, x: number, y: number, ox: number, oy: number): boolean {
        if (get(context, x + ox, y + oy) !== plot.type && get(context, x, y) === plot.type) {
            return !context.visited[x + y * context.width]
        } else {
            return false
        }
    }

    mergeLines(context: TGarden, plot: TPlot, x: number, y: number): void {
        if (get(context, x, y) !== plot.type) {
            return
        }
        const key = x + y * context.width
        if (context.visited[key]) {
            return
        }

        if (get(context, x - 1, y) !== plot.type) {
            if (this.inline(context, plot, x, y - 1, -1, 0)) {
                this.remove(context, plot, x, y)
            }
            if (this.inline(context, plot, x, y + 1, -1, 0)) {
                this.remove(context, plot, x, y)
            }
        }
        if (get(context, x + 1, y) !== plot.type) {
            if (this.inline(context, plot, x, y - 1, 1, 0)) {
                this.remove(context, plot, x, y)
            }
            if (this.inline(context, plot, x, y + 1, 1, 0)) {
                this.remove(context, plot, x, y)
            }
        }
        if (get(context, x, y - 1) !== plot.type) {
            if (this.inline(context, plot, x - 1, y, 0, -1)) {
                this.remove(context, plot, x, y)
            }
            if (this.inline(context, plot, x + 1, y, 0, -1)) {
                this.remove(context, plot, x, y)
            }
        }
        if (get(context, x, y + 1) !== plot.type) {
            if (this.inline(context, plot, x - 1, y, 0, 1)) {
                this.remove(context, plot, x, y)
            }
            if (this.inline(context, plot, x + 1, y, 0, 1)) {
                this.remove(context, plot, x, y)
            }
        }

        context.visited[key] = 1

        this.mergeLines(context, plot, x - 1, y)
        this.mergeLines(context, plot, x + 1, y)
        this.mergeLines(context, plot, x, y - 1)
        this.mergeLines(context, plot, x, y + 1)
    }

    merge(context: TGarden): void {
        context.visited.fill(0)
        for (const plot of context.plots!) {
            const x = plot.key % context.width
            const y = (plot.key - x) / context.width
            this.mergeLines(context, plot, x, y)
        }
    }

    loadInput(): TGarden {
        const data = this.readDataFile()
        const input = data.map(s => s.split(''))
        const width = input[0].length
        const height = input.length
        const context: TGarden = {
            map: input,
            width,
            height,
            visited: new Uint8Array(width * height),
            costs: new Uint8Array(width * height),
        }
        return context
    }

    part1(context: TGarden): number {
        context.plots ??= this.extractPlots(context)

        const total = context.plots.reduce((a, p) => a + p.area * p.perimeter, 0)
        return total
    }

    part2(context: TGarden): number {
        context.plots ??= this.extractPlots(context)

        this.merge(context)

        const total = context.plots.reduce((a, p) => a + p.area * p.perimeter, 0)
        return total
    }
}

// new Day12().execute();
