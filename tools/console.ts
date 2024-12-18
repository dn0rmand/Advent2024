export type Color = {
    R: number
    G: number
    B: number
}

export const black: Color = {
    R: 30,
    G: 30,
    B: 30,
}

export const white: Color = {
    R: 255,
    G: 255,
    B: 255,
}

export class Console {
    static prefix = '\x1b['
    static encoder: TextEncoder | undefined

    static colors = {
        reset: 0,
        // styles
        bold: 1,
        italic: 3,
        underline: 4,
        inverse: 7,
        // resets
        stopBold: 22,
        stopItalic: 23,
        stopUnderline: 24,
        stopInverse: 27,
        // colors
        white: 37,
        black: 30,
        blue: 34,
        cyan: 36,
        green: 32,
        magenta: 35,
        red: 31,
        yellow: 33,
        bgWhite: 47,
        bgBlack: 40,
        bgBlue: 44,
        bgCyan: 46,
        bgGreen: 42,
        bgMagenta: 45,
        bgRed: 41,
        bgYellow: 43,

        grey: 90,
        brightBlack: 90,
        brightRed: 91,
        brightGreen: 92,
        brightYellow: 93,
        brightBlue: 94,
        brightMagenta: 95,
        brightCyan: 96,
        brightWhite: 97,

        bgGrey: 100,
        bgBrightBlack: 100,
        bgBrightRed: 101,
        bgBrightGreen: 102,
        bgBrightYellow: 103,
        bgBrightBlue: 104,
        bgBrightMagenta: 105,
        bgBrightCyan: 106,
        bgBrightWhite: 107,
    }

    static async write(data: string): Promise<void> {
        if (Console.encoder === undefined) {
            Console.encoder = new TextEncoder()
        }
        const buffer = Console.encoder.encode(data)

        await Deno.stdout.write(buffer)
    }

    static async showCursor(): Promise<void> {
        await Console.write(Console.prefix + '?25h')
    }

    static async hideCursor(): Promise<void> {
        await Console.write(Console.prefix + '?25l')
    }

    static async saveCursor(): Promise<void> {
        await Console.write(Console.prefix + 's')
    }

    static async restoreCursor(): Promise<void> {
        await Console.write(Console.prefix + 'u')
    }

    static async up(num: number): Promise<void> {
        await Console.write(Console.prefix + (num || '') + 'A')
    }

    static async down(num: number): Promise<void> {
        await Console.write(Console.prefix + (num || '') + 'B')
    }

    static async forward(num: number): Promise<void> {
        await Console.write(Console.prefix + (num || '') + 'C')
    }

    static async back(num: number): Promise<void> {
        await Console.write(Console.prefix + (num || '') + 'D')
    }

    static async nextLine(num: number): Promise<void> {
        await Console.write(Console.prefix + (num || '') + 'E')
    }

    static async previousLine(num: number): Promise<void> {
        await Console.write(Console.prefix + (num || '') + 'F')
    }

    static async horizontalAbsolute(num: number): Promise<void> {
        await Console.write(Console.prefix + num + 'G')
    }

    static async clear(): Promise<void> {
        await Console.write(Console.prefix + '3J')
        await Console.write(Console.prefix + '2J')
    }

    static async clearFromCursor(): Promise<void> {
        Console.write(Console.prefix + '0J')
    }

    static async clearToCursor(): Promise<void> {
        await Console.write(Console.prefix + '1J')
    }

    static async reset(): Promise<void> {
        await Console.write(Console.prefix + '0m')
    }

    static async eraseLine(): Promise<void> {
        await Console.write(Console.prefix + 'K')
    }

    static async goto(x: number, y: number): Promise<void> {
        await Console.write(Console.prefix + y + ';' + x + 'H')
    }

    static async gotoSOL(): Promise<void> {
        await Console.write('\r')
    }

    static async newLine(): Promise<void> {
        await Console.write('\r\n')
    }

    static async color(color: string): Promise<void> {
        const c = Console.colors[color]
        if (c) {
            await Console.write(Console.prefix + c + 'm')
        }
    }

    static async setForeground(color: Color): Promise<void> {
        await Console.write(`${Console.prefix}38;2;${color.R};${color.G};${color.B}m`)
    }

    static async setBackground(color: Color): Promise<void> {
        await Console.write(`${Console.prefix}48;2;${color.R};${color.G};${color.B}m`)
    }
}
