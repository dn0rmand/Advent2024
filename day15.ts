import { delay } from '@std/async'
import { AsyncDay } from './tools/day.ts'
import { Console } from './tools/console.ts'

enum MOVES {
    NONE = 0,
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4,
}

enum ITEM {
    EMPTY = 0,
    WALL = 1,
    BOX = 2,
    BOXL = 3,
    BOXR = 4,
}

type TRobot = {
    x: number
    y: number
}

type TBox = {
    x: number
    y: number
    type: ITEM
}

type TMap = {
    items: ITEM[][]
    width: number
    height: number
}

type TDirection = {
    dx: number
    dy: number
}

type TInput = {
    map: TMap
    robot: TRobot
    moves: MOVES[]
}

const items = ['.', '#', 'O', '[', ']']

const directions: TDirection[] = [
    { dx: 0, dy: 0 }, // NONE
    { dx: 0, dy: -1 }, // UP
    { dx: 0, dy: 1 }, // DOWN
    { dx: -1, dy: 0 }, // LEFT
    { dx: 1, dy: 0 }, // RIGHT
]

export class Day15 extends AsyncDay<string[]> {
    constructor() {
        super(15)
    }

    loadInput(): string[] {
        const data = this.readDataFile()
        return data
    }

    parseData(data: string[], part2: boolean): TInput {
        const input: TInput = {
            map: { items: [], width: 0, height: 0 },
            robot: { x: 0, y: 0 },
            moves: [],
        }

        const emptyLine = data.indexOf('')

        let y = 0
        for (const line of data.slice(0, emptyLine)) {
            let x = 0
            input.map.items[y] = line.split('').reduce((a: ITEM[], s: string): ITEM[] => {
                if (part2) {
                    if (s === '#') {
                        a.push(ITEM.WALL)
                        a.push(ITEM.WALL)
                    } else if (s === 'O') {
                        a.push(ITEM.BOXL)
                        a.push(ITEM.BOXR)
                    } else if (s === '@') {
                        input.robot.x = x
                        input.robot.y = y
                        a.push(ITEM.EMPTY)
                        a.push(ITEM.EMPTY)
                    } else {
                        a.push(ITEM.EMPTY)
                        a.push(ITEM.EMPTY)
                    }
                    x += 2
                } else {
                    if (s === '#') {
                        a.push(ITEM.WALL)
                    } else if (s === 'O') {
                        a.push(ITEM.BOX)
                    } else if (s === '@') {
                        input.robot.x = x
                        input.robot.y = y
                        a.push(ITEM.EMPTY)
                    } else {
                        a.push(ITEM.EMPTY)
                    }
                    x += 1
                }
                input.map.width = Math.max(input.map.width, x)
                return a
            }, [])
            y++
        }
        input.map.height = y

        for (const line of data.slice(emptyLine + 1)) {
            line.split('').forEach(c => {
                switch (c) {
                    case '^':
                        input.moves.push(MOVES.UP)
                        break
                    case 'v':
                        input.moves.push(MOVES.DOWN)
                        break
                    case '<':
                        input.moves.push(MOVES.LEFT)
                        break
                    case '>':
                        input.moves.push(MOVES.RIGHT)
                        break
                    default:
                        throw 'Invalid move'
                }
            })
        }

        return input
    }

    async dump(input: TInput): Promise<void> {
        Console.goto(1, 1)

        for (let y = 0; y < input.map.height; y++) {
            const line = input.map.items[y].map(i => items[i])
            if (input.robot.y === y) {
                line[input.robot.x] = '@'
            }
            console.log(`\r${line.join('')}`)
        }
        await delay(5)
    }

    // Moves part 1 type of boxes or moves left/right complex boxes
    moveSimpleBox(input: TInput, x0: number, y0: number, direction: TDirection): boolean {
        const x = x0 + direction.dx
        const y = y0 + direction.dy
        if (x < 0 || y < 0 || x >= input.map.width || y >= input.map.height) {
            return false
        }
        switch (input.map.items[y][x]) {
            case ITEM.EMPTY:
                input.map.items[y][x] = input.map.items[y0][x0]
                input.map.items[y0][x0] = ITEM.EMPTY
                return true
            case ITEM.WALL:
                return false
            case ITEM.BOX:
            case ITEM.BOXL:
            case ITEM.BOXR:
                if (this.moveSimpleBox(input, x, y, direction)) {
                    input.map.items[y][x] = input.map.items[y0][x0]
                    input.map.items[y0][x0] = ITEM.EMPTY
                    return true
                } else {
                    return false
                }
            default:
                return false
        }
    }

    moveBoxes(input: TInput, boxes: TBox[], direction: TDirection): boolean {
        if (boxes.length === 0) {
            return true
        }

        const toMove: Map<number, TBox> = new Map()

        // Gather the other boxes to push
        for (const { x: x0, y: y0 } of boxes) {
            const x = x0 + direction.dx
            const y = y0 + direction.dy
            if (x < 0 || y < 0 || x >= input.map.width || y >= input.map.height) {
                return false
            }

            switch (input.map.items[y][x]) {
                case ITEM.EMPTY:
                    break
                case ITEM.WALL:
                    return false
                case ITEM.BOX:
                    throw 'Box type not supported'

                case ITEM.BOXL:
                    toMove.set(x + y * 1000, { x, y, type: ITEM.BOXL })
                    toMove.set(x + 1 + y * 1000, { x: x + 1, y, type: ITEM.BOXR })
                    break
                case ITEM.BOXR:
                    toMove.set(x - 1 + y * 1000, { x: x - 1, y, type: ITEM.BOXL })
                    toMove.set(x + y * 1000, { x, y, type: ITEM.BOXR })
                    break
                default:
                    return false
            }
        }

        // push the other ones
        if (!this.moveBoxes(input, [...toMove.values()], direction)) {
            return false
        }
        // Then we can move
        for (const { x: x0, y: y0, type } of boxes) {
            const x = x0 + direction.dx
            const y = y0 + direction.dy

            input.map.items[y][x] = type
            input.map.items[y0][x0] = ITEM.EMPTY
        }
        return true
    }

    moveRobot(input: TInput, direction: TDirection): void {
        const x = input.robot.x + direction.dx
        const y = input.robot.y + direction.dy

        if (x < 0 || y < 0 || x >= input.map.width || y >= input.map.height) {
            return
        }

        switch (input.map.items[y][x]) {
            case ITEM.EMPTY:
                input.robot.x = x
                input.robot.y = y
                break
            case ITEM.WALL:
                break
            case ITEM.BOXL:
                if (direction.dy === 0) {
                    if (this.moveSimpleBox(input, x, y, direction)) {
                        input.robot.x = x
                        input.robot.y = y
                    }
                    break
                }
                if (
                    this.moveBoxes(
                        input,
                        [
                            { x, y, type: ITEM.BOXL },
                            { x: x + 1, y, type: ITEM.BOXR },
                        ],
                        direction
                    )
                ) {
                    input.robot.x = x
                    input.robot.y = y
                }
                break
            case ITEM.BOXR:
                if (direction.dy === 0) {
                    if (this.moveSimpleBox(input, x, y, direction)) {
                        input.robot.x = x
                        input.robot.y = y
                    }
                    break
                }
                if (
                    this.moveBoxes(
                        input,
                        [
                            { x: x - 1, y, type: ITEM.BOXL },
                            { x, y, type: ITEM.BOXR },
                        ],
                        direction
                    )
                ) {
                    input.robot.x = x
                    input.robot.y = y
                }
                break
            case ITEM.BOX:
                if (this.moveSimpleBox(input, x, y, direction)) {
                    input.robot.x = x
                    input.robot.y = y
                }
                break
        }
    }

    gps(map: TMap): number {
        let total = 0
        for (let y = 1; y < map.height - 1; y++) {
            for (let x = 1; x < map.width - 1; x++) {
                if (map.items[y][x] === ITEM.BOX) {
                    total += 100 * y + x
                } else if (map.items[y][x] === ITEM.BOXL) {
                    total += 100 * y + x
                }
            }
        }
        return total
    }

    async part1Async(data: string[]): Promise<number> {
        const input = this.parseData(data, false)
        for (const move of input.moves) {
            this.moveRobot(input, directions[move])
        }

        return await Promise.resolve(this.gps(input.map))
    }

    async part2Async(data: string[]): Promise<number> {
        const input = this.parseData(data, true)
        // await this.dump(input)
        for (const move of input.moves) {
            this.moveRobot(input, directions[move])
            // await this.dump(input)
        }
        return await Promise.resolve(this.gps(input.map))
    }
}

// await new Day15().executeAsync()
