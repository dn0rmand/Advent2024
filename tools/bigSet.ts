export class BigSet<T> {
    static maxSize = 2 ** 24 - 100

    map: Set<T> = new Set()
    maps: Set<T>[] = []

    constructor() {}

    get size(): number {
        return this.maps.reduce((a, m) => a + m.size, this.map.size)
    }

    has(key: T): boolean {
        if (this.map.has(key)) {
            return true
        }

        return this.maps.some(m => m.has(key))
    }

    add(key: T) {
        if (this.has(key)) {
            return
        }

        this.map.add(key)
        if (this.map.size >= BigSet.maxSize) {
            this.maps.push(this.map)
            this.map = new Set()
        }
    }

    clear() {
        this.map.clear()
        for (const m of this.maps) {
            m.clear()
        }

        this.maps = []
    }
}
