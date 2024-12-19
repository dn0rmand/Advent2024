import { Console, Color, white, black } from './console.ts'

type Cell = {
    value: string
    foreground: Color
    background: Color
}

export class Screen {
    width: number
    height: number
    buffer: Cell[][]
    keys: Uint8Array = new Uint8Array(1)

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.buffer = new Array(this.height)
        for (let y = 0; y < this.height; y++) {
            this.buffer[y] = new Array(this.width)
            this.buffer[y].fill({ value: ' ', foreground: white, background: black })
        }

        Deno.stdin.setRaw(true)
        Console.hideCursor()
    }

    async keypressed(): Promise<number> {
        if ((await Deno.stdin.read(this.keys)) === 1) {
            return this.keys[0]
        }
        return 0
    }

    async close(): Promise<void> {
        await Console.goto(1, 1)
        await Console.clear()
        await Console.showCursor()
        Deno.stdin.setRaw(false)
    }

    sameColor(c1: Color, c2: Color): boolean {
        return c1.R === c2.R && c1.G === c2.G && c1.B === c2.B
    }

    clear() {
        for (let y = 0; y < this.height; y++) {
            this.buffer[y].fill({ value: ' ', foreground: white, background: black })
        }
    }

    setCell(x: number, y: number, value: string, foreground: Color = white, background: Color = black): void {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.buffer[y][x] = { value, foreground, background }
        }
    }

    async render(): Promise<void> {
        await Console.setBackground(black)
        await Console.setForeground(white)

        for (let y = 0; y < this.height; y++) {
            let foreground: Color = black
            let background: Color = white
            await Console.goto(1, y + 1)
            for (let x = 0; x < this.width; x++) {
                const cell = this.buffer[y][x]
                if (!this.sameColor(cell.foreground, foreground)) {
                    foreground = cell.foreground
                    await Console.setForeground(foreground)
                }
                if (!this.sameColor(cell.background, background)) {
                    background = cell.background
                    await Console.setBackground(background)
                }
                await Console.write(cell.value)
            }
            await Console.setBackground(black)
            await Console.setForeground(white)
            await Console.eraseLine()
        }

        await Console.clearFromCursor()
    }
}
