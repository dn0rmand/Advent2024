import { Day } from './tools/day.ts'

enum ITEM {
    EMPTY = 0,
    WALL = 1,
}

type TPosition = {
    x: number
    y: number
}

type TDirection = {
    dx: number
    dy: number
}

type TPoint = {
    x: number
    y: number
    time: number
}

const directions: TDirection[] = [
    { dx: 0, dy: -1 }, // UP
    { dx: 0, dy: 1 }, // DOWN
    { dx: -1, dy: 0 }, // LEFT
    { dx: 1, dy: 0 }, // RIGHT
]

type TMap = {
    items: ITEM[][]
    width: number
    height: number
    start: TPosition
    end: TPosition
}

export class Day20 extends Day<TMap> {
    path?: TPoint[]
    indexes?: TPoint[][]

    constructor() {
        super(20)
    }

    loadInput(): TMap {
        const data = this.readDataFile()
        const input: TMap = {
            items: [],
            width: data[0].length,
            height: data.length,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
        }

        input.items = data.map((row, y) =>
            row.split('').map((item, x) => {
                if (item === 'E') {
                    input.end = { x, y }
                    return ITEM.EMPTY
                } else if (item === 'S') {
                    input.start = { x, y }
                    return ITEM.EMPTY
                } else {
                    return item === '#' ? ITEM.WALL : ITEM.EMPTY
                }
            })
        )

        return input
    }

    calculatePath(map: TMap): void {
        if (!this.path) {
            this.path = []
            this.indexes = []

            let current = map.start
            let previous = map.start
            let time = 0
            this.indexes[map.start.y] = []
            this.indexes[map.end.y] = []
            while (current.x !== map.end.x || current.y !== map.end.y) {
                const point: TPoint = { x: current.x, y: current.y, time }
                this.path.push(point)
                this.indexes[current.y].push(point)
                time++

                for (const { dx, dy } of directions) {
                    const x = current.x + dx
                    const y = current.y + dy
                    if (map.items[y][x] === ITEM.EMPTY && (x !== previous.x || y !== previous.y)) {
                        previous = current
                        current = { x, y }
                        this.indexes[y] ??= []
                        break
                    }
                }
            }

            const point: TPoint = { x: current.x, y: current.y, time }
            this.path.push(point)
            this.indexes[current.y].push(point)
            this.indexes.forEach(pts => {
                if (pts) {
                    pts.sort((a, b) => a.x - b.x)
                }
            })
        }
    }

    findCheats(map: TMap, distance: number): number {
        this.calculatePath(map)

        const path = this.path!
        const indexes = this.indexes!

        let cheats = 0

        for (let i = 0; i < path.length; i++) {
            const { x: x0, y: y0, time: startTime } = path[i]

            for (let y = Math.max(1, y0 - distance); y <= Math.min(map.height - 2, y0 + distance); y++) {
                const points = indexes[y]
                cheats += points.reduce((count, { x: x1, y: y1, time: endTime }) => {
                    const d = Math.abs(x0 - x1) + Math.abs(y0 - y1)
                    if (d > distance) {
                        return count
                    }
                    const newEndTime = startTime + d
                    return count + (endTime - newEndTime >= 100 ? 1 : 0)
                }, 0)
            }
        }

        return cheats
    }

    part1(map: TMap): number {
        const cheats = this.findCheats(map, 2)
        return cheats
    }

    part2(map: TMap): number {
        const cheats = this.findCheats(map, 20)
        return cheats
    }
}

// new Day20().execute()
