import { Day } from './tools/day.ts'
import { modInv, modMul, chineseRemainder } from './tools/numberHelper.ts'

type TPosition = {
    x: number
    y: number
}

type TRobot = {
    position: TPosition
    vx: number
    vy: number
}

type TRobots = TRobot[]

export class Day14 extends Day<TRobots> {
    static robotSearch: RegExp = /(?:p=)(\d*)(?:,)(\d*)(?: v=)(-?\d*)(?:,)(-?\d*)/g

    width: number = 11
    height: number = 7
    xMiddle: number = 5
    yMiddle: number = 3

    constructor() {
        super(14)
    }

    parseRobot(input: string): TRobot {
        const v = input.matchAll(Day14.robotSearch).next().value!

        const robot = {
            position: {
                x: +v[1],
                y: +v[2],
            },
            vx: +v[3],
            vy: +v[4],
        }
        if (robot.position.x >= this.width) {
            this.width = robot.position.x + 1
        }
        if (robot.position.y >= this.height) {
            this.height = robot.position.y + 1
        }
        return robot
    }

    loadInput(): TRobots {
        const data = this.readDataFile()
        const robots = data.map(d => this.parseRobot(d))

        this.xMiddle = Math.floor(this.width / 2)
        this.yMiddle = Math.floor(this.height / 2)
        return robots
    }

    moveRobot(robot: TRobot, time: number): TRobot {
        const ox = (time * robot.vx) % this.width
        const oy = (time * robot.vy) % this.height

        robot.position.x = (robot.position.x + this.width + ox) % this.width
        robot.position.y = (robot.position.y + this.height + oy) % this.height

        return robot
    }

    quadrant({ position: { x, y } }: TRobot): number {
        if (x === this.xMiddle || y === this.yMiddle) {
            return 100
        }
        const a = y < this.yMiddle ? 0 : 1
        const b = x < this.xMiddle ? 0 : 1

        return a * 2 + b
    }

    getQuadrants(robots: TRobots, time: number): Uint16Array {
        const quadrants = robots.reduce((quadrants, robot) => {
            if (time) {
                this.moveRobot(robot, time)
            }
            quadrants[this.quadrant(robot)]++
            return quadrants
        }, new Uint16Array(4))

        return quadrants
    }

    dangerLevel(robots: TRobots, time: number): number {
        const quadrants = this.getQuadrants(robots, time)
        const danger = quadrants.reduce((a, c) => a * c, 1)
        return danger
    }

    makeKey(x: number, y: number): number {
        return x + y * this.width
    }

    hasRobot(indexes: Uint8Array, r: TRobot, x: number, y: number): boolean {
        const key = this.makeKey(x + r.position.x, y + r.position.y)
        return indexes[key] !== 0
    }

    validateTree(indexes: Uint8Array, r: TRobot): boolean {
        for (let i = 0; i < 22; i++) {
            if (!this.hasRobot(indexes, r, 14, 6 + i)) {
                return false
            }
            if (!this.hasRobot(indexes, r, 15, 6 + i)) {
                return false
            }
            if (!this.hasRobot(indexes, r, 16, 6 + i)) {
                return false
            }
        }

        return true
    }

    hasTree(robots: TRobots, indexes: Uint8Array): TRobot | undefined {
        const OX = 30
        const OY = 32
        const w = this.width - OX
        const h = this.height - OY

        const robot = robots.find(
            r1 =>
                r1.position.x < w &&
                r1.position.y < h &&
                this.hasRobot(indexes, r1, OX, 0) &&
                this.hasRobot(indexes, r1, 0, OY) &&
                this.hasRobot(indexes, r1, OX, OY) &&
                this.hasRobot(indexes, r1, 0, 16) &&
                this.hasRobot(indexes, r1, OX, 16) &&
                this.hasRobot(indexes, r1, 16, 0) &&
                this.hasRobot(indexes, r1, 16, OY) &&
                this.validateTree(indexes, r1)
        )

        return robot
    }

    part1(robots: TRobots): number {
        // clone robot to all part 2
        robots = robots.map(robot => ({ ...robot, position: { ...robot.position } }))
        return this.dangerLevel(robots, 100)
    }

    lineIndexH(robots: TRobots): number {
        const groups: Set<number>[] = []
        let index = 0

        robots.forEach(r => {
            let s = groups[r.position.y]
            if (!s) {
                s = new Set()
                groups[r.position.y] = s
            }
            s.add(r.position.x)
            index = Math.max(s.size, index)
        })

        return index
    }

    lineIndexV(robots: TRobots): number {
        const groups: Set<number>[] = []
        let index = 0

        robots.forEach(r => {
            let s = groups[r.position.x]
            if (!s) {
                s = new Set()
                groups[r.position.x] = s
            }
            s.add(r.position.y)
            index = Math.max(s.size, index)
        })

        return index
    }

    part2(robots: TRobots): number {
        let steps = 0

        let h = -1
        let v = -1
        const target = 25

        while (steps < 103 && (h < 0 || v < 0)) {
            steps++
            robots.forEach(robot => this.moveRobot(robot, 1))
            if (h < 0) {
                const i = this.lineIndexH(robots)
                if (i >= target) {
                    h = steps
                }
            }
            if (v < 0) {
                const i = this.lineIndexV(robots)
                if (i > target) {
                    v = steps
                }
            }
        }

        if (h < 0 || v < 0) {
            throw "That didn't work!!!"
        }

        return chineseRemainder(101, 103, v, h)
    }

    // Slower way that requires knowing the shape of the tree
    $part2(robots: TRobots): number {
        const indexes = new Uint8Array(this.width * this.height)

        let steps = 0
        while (steps < 10000) {
            steps++

            // move and build index
            indexes.fill(0)
            robots.forEach(robot => {
                this.moveRobot(robot, 1)
                indexes[this.makeKey(robot.position.x, robot.position.y)]++
            })
            // Check for tree
            if (this.hasTree(robots, indexes)) {
                break
            }
        }

        return steps
    }
}

new Day14().execute()
