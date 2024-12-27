export interface IDay {
    isAsync: boolean
    day: number
    title: string
    execute(): void
    executeAsync(): Promise<void>
}

export abstract class Day<T> implements IDay {
    day: number
    title: string
    isAsync: boolean = false
    private fileContent: string[]

    constructor(day: number, title?: string) {
        this.day = day
        this.title = title ?? `Day ${day}`
        const data = Deno.readTextFileSync(`./data/day${this.day}.data`)
        this.fileContent = data.split('\n')
    }

    abstract part1(input: T): number | string
    abstract part2(input: T): number | string
    abstract loadInput(): T

    timeStart(name: string) {
        const key = name.toLowerCase().replace('  ', '-')
        console.time(`day${this.day}:${key}`)
    }

    timeEnd(name: string) {
        const key = name.toLowerCase().replace('  ', '-')
        console.timeLog(`day${this.day}:${key}`, `to ${name === 'input' ? 'parse' : 'execute'} ${name} of day ${this.day}`)
    }

    readDataFile(): string[] {
        return this.fileContent
    }

    async executeAsync(): Promise<void> {
        this.execute()
        await Promise.resolve()
    }

    execute(): void {
        try {
            console.log(`--- Day ${this.day}: ${this.title} ---`)

            this.timeStart('total')

            this.timeStart('input')
            const input = this.loadInput()
            this.timeEnd('input')

            this.timeStart('part-1')
            console.log(`Part 1: ${this.part1(input)}`)
            this.timeEnd('part-1')

            this.timeStart('part-2')
            console.log(`Part 2: ${this.part2(input)}`)
            this.timeEnd('part-2')

            this.timeEnd('total')
        } catch (error) {
            // deno-lint-ignore no-debugger
            debugger
            throw error
        }
    }
}

export abstract class AsyncDay<T> extends Day<T> {
    constructor(day: number, title?: string) {
        super(day, title)
        this.isAsync = true
    }

    part1(_input: T): number | string {
        throw 'Not Supported'
    }

    part2(_input: T): number | string {
        throw 'Not Supported'
    }

    abstract part1Async(input: T): Promise<number | string>
    abstract part2Async(input: T): Promise<number | string>

    override async executeAsync(): Promise<void> {
        try {
            console.log(`--- Day ${this.day}: ${this.title} ---`)

            this.timeStart('total')

            this.timeStart('input')
            const input = this.loadInput()
            this.timeEnd('input')

            this.timeStart('part-1')
            console.log(`Part 1: ${await this.part1Async(input)}`)
            this.timeEnd('part-1')

            this.timeStart('part-2')
            console.log(`Part 2: ${await this.part2Async(input)}`)
            this.timeEnd('part-2')

            this.timeEnd('total')
        } catch (error) {
            throw error
        }
    }
}
