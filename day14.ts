import { PNGImage } from './png/PNGImage.ts';
import { delay } from '@std/async';
import { AsyncDay } from './tools/day.ts';
import { printImage } from './tools/printImage.ts';
import { Console } from './tools/console.ts';

type TPosition = {
    x: number;
    y: number;
};

type TRobot = {
    position: TPosition;
    vx: number;
    vy: number;
};

type TRobots = TRobot[];

export class Day14 extends AsyncDay<TRobots> {
    static robotSearch: RegExp = /(?:p=)(\d*)(?:,)(\d*)(?: v=)(-?\d*)(?:,)(-?\d*)/g;

    width: number = 11;
    height: number = 7;
    xMiddle: number = 5;
    yMiddle: number = 3;

    constructor() {
        super(14);
    }

    parseRobot(input: string): TRobot {
        const v = input.matchAll(Day14.robotSearch).next().value!;

        const robot = {
            position: {
                x: +v[1],
                y: +v[2],
            },
            vx: +v[3],
            vy: +v[4],
        };
        if (robot.position.x >= this.width) {
            this.width = robot.position.x + 1;
        }
        if (robot.position.y >= this.height) {
            this.height = robot.position.y + 1;
        }
        return robot;
    }

    loadInput(): TRobots {
        const data = this.readDataFile();
        const robots = data.map(d => this.parseRobot(d));

        this.xMiddle = Math.floor(this.width / 2);
        this.yMiddle = Math.floor(this.height / 2);
        return robots;
    }

    moveRobot(robot: TRobot, time: number): TRobot {
        const ox = (time * robot.vx) % this.width;
        const oy = (time * robot.vy) % this.height;

        robot.position.x = (robot.position.x + this.width + ox) % this.width;
        robot.position.y = (robot.position.y + this.height + oy) % this.height;

        return robot;
    }

    quadrant({ position: { x, y } }: TRobot): number {
        if (x === this.xMiddle || y === this.yMiddle) {
            return 100;
        }
        const a = y < this.yMiddle ? 0 : 1;
        const b = x < this.xMiddle ? 0 : 1;

        return a * 2 + b;
    }

    getQuadrants(robots: TRobots, time: number): Uint16Array {
        const quadrants = robots.reduce((quadrants, robot) => {
            if (time) {
                this.moveRobot(robot, time);
            }
            quadrants[this.quadrant(robot)]++;
            return quadrants;
        }, new Uint16Array(4));

        return quadrants;
    }

    dangerLevel(robots: TRobots, time: number): number {
        const quadrants = this.getQuadrants(robots, time);
        const danger = quadrants.reduce((a, c) => a * c, 1);
        return danger;
    }

    makeKey(x: number, y: number): number {
        return x + y * this.width;
    }

    hasRobot(indexes: Uint8Array, r: TRobot, x: number, y: number): boolean {
        const key = this.makeKey(x + r.position.x, y + r.position.y);
        return indexes[key] !== 0;
    }

    validateTree(indexes: Uint8Array, r: TRobot): boolean {
        for (let i = 0; i < 22; i++) {
            if (!this.hasRobot(indexes, r, 14, 6 + i)) {
                return false;
            }
            if (!this.hasRobot(indexes, r, 15, 6 + i)) {
                return false;
            }
            if (!this.hasRobot(indexes, r, 16, 6 + i)) {
                return false;
            }
        }

        return true;
    }

    hasTree(robots: TRobots, indexes: Uint8Array): TRobot | undefined {
        const OX = 30;
        const OY = 32;
        const w = this.width - OX;
        const h = this.height - OY;

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
        );

        return robot;
    }

    async dump(robots: TRobots, indexes?: Uint8Array): Promise<void> {
        const png = new PNGImage(this.width, this.height, 4, { r: 0, g: 0, b: 0, a: 1 });
        const red = png.createRGBColor({ r: 255, g: 0, b: 0, a: 1 });
        const green = png.createRGBColor({ r: 0, g: 255, b: 0, a: 1 });
        const white = png.createRGBColor({ r: 255, g: 255, b: 255, a: 1 });

        for (const robot of robots) {
            const { x, y } = robot.position;
            png.setPixel(x, y, white);
        }

        if (indexes) {
            const r0 = this.hasTree(robots, indexes)!;

            const OX = 30;
            const OY = 32;

            png.setPixel(r0.position.x, r0.position.y, red);
            png.setPixel(r0.position.x, r0.position.y + OY, green);
            png.setPixel(r0.position.x + OX, r0.position.y + OY, green);
            png.setPixel(r0.position.x, r0.position.y + 16, green);
            png.setPixel(r0.position.x + OX, r0.position.y + 16, green);
            png.setPixel(r0.position.x + 16, r0.position.y, green);
            png.setPixel(r0.position.x + 16, r0.position.y + OY, green);

            for (let i = 0; i < 22; i++) {
                png.setPixel(r0.position.x + 14, r0.position.y + 6 + i, green);
                png.setPixel(r0.position.x + 15, r0.position.y + 6 + i, green);
                png.setPixel(r0.position.x + 16, r0.position.y + 6 + i, green);
            }
        }

        await printImage(png.getBuffer(), { width: `40`, height: `40` });
    }

    async part1Async(robots: TRobots): Promise<number> {
        // clone robot to all part 2
        robots = robots.map(robot => ({ ...robot, position: { ...robot.position } }));
        return await Promise.resolve(this.dangerLevel(robots, 100));
    }

    async $part2Async(robots: TRobots): Promise<number> {
        let steps = 6600;

        robots = robots.map(robot => this.moveRobot(robot, steps));

        const indexes = new Uint8Array(this.width * this.height);
        Console.savePosition();

        while (true) {
            steps++;
            Console.restorePosition();
            Console.savePosition();

            indexes.fill(0);
            robots.forEach(robot => {
                this.moveRobot(robot, 1);
                indexes[this.makeKey(robot.position.x, robot.position.y)]++;
            });
            await this.dump(robots);
            await delay(50);

            if (this.hasTree(robots, indexes)) {
                await this.dump(robots, indexes);
                break;
            }
        }

        return await Promise.resolve(steps);
    }

    async part2Async(robots: TRobots): Promise<number> {
        const indexes = new Uint8Array(this.width * this.height);

        let steps = 0;
        while (steps < 10000) {
            steps++;

            // move and build index
            indexes.fill(0);
            robots.forEach(robot => {
                this.moveRobot(robot, 1);
                indexes[this.makeKey(robot.position.x, robot.position.y)]++;
            });
            // Check for tree
            if (this.hasTree(robots, indexes)) {
                // delay(100).then(async () => await this.dump(robots, indexes));
                break;
            }
        }

        return await Promise.resolve(steps);
    }
}

// await new Day14().executeAsync();
