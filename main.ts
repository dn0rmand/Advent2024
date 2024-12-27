import { IDay } from './tools/day.ts'
import { Day1 } from './day1.ts'
import { Day2 } from './day2.ts'
import { Day3 } from './day3.ts'
import { Day4 } from './day4.ts'
import { Day5 } from './day5.ts'
import { Day6 } from './day6.ts'
import { Day7 } from './day7.ts'
import { Day8 } from './day8.ts'
import { Day9 } from './day9.ts'
import { Day10 } from './day10.ts'
import { Day11 } from './day11.ts'
import { Day12 } from './day12.ts'
import { Day13 } from './day13.ts'
import { Day14 } from './day14.ts'
import { Day15 } from './day15.ts'
import { Day16 } from './day16.ts'
import { Day17 } from './day17.ts'
import { Day18 } from './day18.ts'
import { Day19 } from './day19.ts'
import { Day20 } from './day20.ts'
import { Day21 } from './day21.ts'
import { Day22 } from './day22.ts'
import { Day23 } from './day23.ts'
import { Day24 } from './day24.ts'
import { Day25 } from './day25.ts'

const days: IDay[] = [
    new Day1(),
    new Day2(),
    new Day3(),
    new Day4(),
    new Day5(),
    new Day6(),
    new Day7(),
    new Day8(),
    new Day9(),
    new Day10(),
    new Day11(),
    new Day12(),
    new Day13(),
    new Day14(),
    new Day15(),
    new Day16(),
    new Day17(),
    new Day18(),
    new Day19(),
    new Day20(),
    new Day21(),
    new Day22(),
    new Day23(),
    new Day24(),
    new Day25(),
]

type TimeEntry = {
    duration: number
    message: string
}

const times: { [id: string]: TimeEntry } = {}

function compare(a: TimeEntry, b: TimeEntry): number {
    return a.duration - b.duration
}

const output = console.log

console.debug = () => {}

const dayLog = (buffer: string[]) => (msg: string) => {
    buffer.push(msg)
}

console.time = (key: string) => {
    if (key[0] == '@') {
        performance.mark(key + '$start')
    }
}

console.timeLog = (key: string, msg: string) => {
    if (key[0] == '@') {
        performance.mark(key + '$end')
        const t = performance.measure(key, key + '$start', key + '$end')
        times[key] = {
            duration: t.duration,
            message: `${t.duration.toFixed(5)}ms ${msg}`,
        }
    }
}

function format(value: string | number, length: number, direction: 'L' | 'R' = 'R') {
    const s = `${value}`
    if (s.length < length) {
        return direction === 'L' ? ' '.repeat(length - s.length) + s : s + ' '.repeat(length - s.length)
        return
    } else {
        return s.substring(0, length)
    }
}

async function executeAll() {
    console.time('@advent-2024')

    output('┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐')
    output('│ 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄  ADVENT OF CODE 2024  🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 🎅🏻 🎄 │')
    output('├─────┬───────────────────────────┬──────────────────────┬──────────────────────────────────────────┬─────────────┤')
    output('│ Day │ Title                     │ Part 1               │ Part 2                                   │ Time in ms  │')

    for (const day of days) {
        const lines: string[] = []
        console.log = dayLog(lines)
        const key = `@day${day.day}`
        const msg = `to execute both parts of day ${day.day}`
        console.time(key)
        if (day.isAsync) {
            await day.executeAsync()
        } else {
            day.execute()
        }
        console.timeLog(key, msg)

        const p1 = lines[1].split('Part 1: ')[1]
        const p2 = lines[2].split('Part 2: ')[1]
        const duration = times[`@day${day.day}`].duration
        const ms = `${duration.toFixed(4)} ms`

        output('├─────┼───────────────────────────┼──────────────────────┼──────────────────────────────────────────┼─────────────┤')
        output(`│ ${format(day.day, 3, 'L')} │ ${format(day.title, 25)} │ ${format(p1, 20)} │ ${format(p2, 40)} │ ${format(ms, 11, 'L')} │`)
    }
    console.timeLog('@advent-2024', 'to execute them all')

    const total = `${times['@advent-2024'].duration.toFixed(4)} ms`

    output('└─────┴───────────────────────────┴──────────────────────┴──────────────────────────────────────────┼─────────────┤')
    output(`                                                                                                    │ ${format(total, 11, 'L')} │`)
    output('                                                                                                    └─────────────┘')

    times['@advent-2024'].duration = 0 // For the sorting

    const order = Object.keys(times)
        .filter(k => k !== '@advent-2024')
        .filter(k => times[k].duration > 10)
        .sort((a: string, b: string) => compare(times[b], times[a]))

    for (const key of order) {
        output(times[key].message)
    }
    output('\r')
}

await executeAll()
