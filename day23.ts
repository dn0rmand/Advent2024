import { Day } from './tools/day.ts'

export class Day23 extends Day<void> {
    connections: Map<string, string[]> = new Map()
    computers: string[] = []
    bestSet: string[] = []
    max: number = 0

    constructor() {
        super(23)
    }

    loadInput(): void {
        const data = this.readDataFile()

        const connections: Map<string, string[]> = new Map()
        const computers: Set<string> = new Set()

        for (const row of data) {
            const [left, right] = row.split('-')
            computers.add(left)
            computers.add(right)

            let leftConnections = connections.get(left)
            let rightConnections = connections.get(right)
            if (!leftConnections) {
                leftConnections = [right]
                connections.set(left, leftConnections)
            } else if (!leftConnections.includes(right)) {
                leftConnections.push(right)
            }

            if (!rightConnections) {
                rightConnections = [left]
                connections.set(right, rightConnections)
            } else if (!rightConnections.includes(left)) {
                rightConnections.push(left)
            }
        }

        this.connections = connections
        this.computers = [...computers.keys()].sort((a, b) => a.localeCompare(b))
    }

    $visited: Set<string> = new Set()

    buildSet(remaining: string[], used: string[]): void {
        if (used.length > this.bestSet.length) {
            this.bestSet = [...used]
            if (used.length === this.max) {
                return
            }
        }

        if (remaining.length === 0) {
            return
        }

        const max = used.length + remaining.length
        if (max <= this.bestSet.length) {
            return
        }

        const key = used.sort((a, b) => a.localeCompare(b)).join(':')
        if (this.$visited.has(key)) {
            return
        }
        this.$visited.add(key)

        for (const a of remaining) {
            if (this.bestSet.length === this.max) {
                break
            }
            const connections = this.connections.get(a)!
            if (used.some(c => !connections.includes(c))) {
                continue
            }

            const newRemaining = remaining.filter(x => !used.includes(x) && connections.includes(x))
            if (newRemaining.length + 1 + used.length > this.bestSet.length) {
                used.push(a)
                this.buildSet(newRemaining, used)
                used.pop()
            }
        }
    }

    findSetsOf3(a: string, found: Set<string>): void {
        for (const b of this.connections.get(a)!) {
            for (const c of this.connections.get(b)!) {
                if (c !== a) {
                    const cConnections = this.connections.get(c)!
                    if (cConnections.includes(a)) {
                        const s = [a, b, c].sort((a, b) => a.localeCompare(b))
                        const k = s.join(',')
                        found.add(k)
                    }
                }
            }
        }
    }

    part1(): number {
        const computers = this.computers.filter(c => c[0] === 't')

        const all_sets: Set<string> = new Set()
        for (const computer of computers) {
            this.findSetsOf3(computer, all_sets)
        }

        return all_sets.size
    }

    part2(): string {
        this.max = 0
        this.connections.forEach(connections => (this.max = Math.max(this.max, connections.length)))

        this.buildSet(this.computers, [])

        this.bestSet.sort((a, b) => a.localeCompare(b))

        return this.bestSet.join(',')
    }
}

// new Day23().execute()
