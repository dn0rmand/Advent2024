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

class State {
    position: TPosition
    time: number
    key: number
    ghost: boolean

    static makeKey({ x, y }: TPosition): number {
        return x + 150 * y
    }

    static fromKey(key: number): TPosition {
        const x = key % 150
        const y = (key - x) / 150

        return { x, y }
    }

    constructor(position: TPosition, time: number, ghost: boolean) {
        this.position = position
        this.time = time
        this.ghost = ghost
        this.key = State.makeKey(this.position)
    }

    static getItem(map: TMap, x: number, y: number, ghost: boolean): ITEM | undefined {
        if (x <= 0 || y <= 0 || x >= map.width - 1 || y >= map.height - 1) {
            return undefined
        }

        return ghost ? ITEM.EMPTY : map.items[y][x]
    }

    create(map: TMap, dx: number, dy: number): State | undefined {
        const x = this.position.x + dx
        const y = this.position.y + dy
        const item = State.getItem(map, x, y, this.ghost)
        if (item !== ITEM.EMPTY) {
            return undefined
        }
        return new State({ x, y }, this.time + 1, this.ghost)
    }

    moves(map: TMap): State[] {
        const newStates: State[] = []

        for (const { dx, dy } of directions) {
            const newState = this.create(map, dx, dy)
            if (newState) {
                newStates.push(newState)
            }
        }

        return newStates
    }
}

export class Day20 extends Day<TMap> {
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

    findMaxTimePath(map: TMap): Map<number, number> {
        const states: State[] = [new State(map.start, 0, false)]
        const path: Map<number, number> = new Map()

        path.set(State.makeKey(map.start), 0)

        while (states.length > 0) {
            const state = states.pop()!

            for (const newState of state.moves(map)) {
                const key = newState.key
                if (path.has(key)) {
                    continue
                }
                path.set(key, newState.time)
                if (newState.position.x === map.end.x && newState.position.y === map.end.y) {
                    return path
                }
                states.push(newState)
            }
        }
        throw 'Could not find exit'
    }

    shortCuts(map: TMap, path: Map<number, number>, start: number, distance: number): Map<number, number> {
        const { x, y } = State.fromKey(start)
        const startTime = path.get(start)!

        let states: Map<number, State> = new Map()
        let newStates: Map<number, State> = new Map()

        const ends: Map<number, number> = new Map()
        const visited: number[] = []

        const startState = new State({ x, y }, startTime, true)
        states.set(startState.key, startState)
        visited[startState.key] = 1

        const maxTime = startTime + distance
        while (states.size > 0) {
            newStates.clear()

            for (const state of states.values()) {
                if (state.time >= maxTime) {
                    continue
                }
                for (const newState of state.moves(map)) {
                    const key = newState.key
                    if (visited[key]) {
                        continue
                    }
                    visited[key] = 1

                    const endTime = path.get(key)
                    if (endTime !== undefined && newState.time < endTime) {
                        const saved = endTime - newState.time
                        const oldSaved = ends.get(key)
                        if (oldSaved === undefined || saved > oldSaved) {
                            ends.set(key, saved)
                        }
                    }

                    // if (newState.position.x !== map.end.x || newState.position.y !== map.end.y) {
                    newStates.set(key, newState)
                    // }
                }
            }

            const tmp = states
            states = newStates
            newStates = tmp
        }

        return ends
    }

    findCheats(map: TMap, distance: number): number {
        const path = this.findMaxTimePath(map)

        let cheats = 0

        for (const start of path.keys()) {
            const shortCuts: number[] = []
            for (const [end, saved] of this.shortCuts(map, path, start, distance)) {
                if (saved >= 100 && !shortCuts[end]) {
                    shortCuts[end] = 1
                    cheats++
                }
            }
        }

        return cheats
    }

    part1(map: TMap): number {
        return this.findCheats(map, 2)
    }

    part2(map: TMap): number {
        return this.findCheats(map, 20)
    }
}

new Day20().execute()
