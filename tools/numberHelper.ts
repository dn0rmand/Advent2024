export function gcd(a: number, b: number): number {
    if (a < b) {
        ;[a, b] = [b, a]
    }

    while (b !== 0) {
        ;[a, b] = [b, a % b]
    }
    return Math.abs(a)
}

export function lcm(a: number, b: number): number {
    return (a / gcd(a, b)) * b
}

export function factorial(n: number): number {
    let f = 1
    for (let i = 2; i <= n; i++) {
        f *= i
    }
    if (f > Number.MAX_SAFE_INTEGER) {
        throw 'Factorial too big'
    }
    return f
}

export function modMul(v1: number, v2: number, modulo: number): number {
    const v = v1 * v2
    if (v > Number.MAX_SAFE_INTEGER) {
        const b = (BigInt(v1) * BigInt(v2)) % BigInt(modulo)
        return Number(b)
    } else {
        return v % modulo
    }
}

export function modInv(value: number, modulo: number): number {
    let t = 0
    let newT = 1
    let r = modulo
    let newR = value
    let q, lastT, lastR

    if (newR < 0) {
        newR = -newR
    }

    while (newR != 0) {
        q = Math.floor(r / newR)
        lastT = t
        lastR = r
        t = newT
        r = newR
        newT = lastT - q * newT
        newR = lastR - q * newR
    }
    if (r != 1) {
        throw new Error(`${value} and ${modulo} are not co-prime`)
    }
    if (t < 0) {
        t += modulo
    }

    return modulo < 0 ? -t : t
}

export function chineseRemainder(p: number, q: number, a: number, b: number): number {
    const pq = p * q
    const s = modMul(modInv(q, p), q, pq)
    const m1 = modMul(a, s, pq)
    if (b === 0) {
        return m1
    } else {
        const t = modMul(p, modInv(p, q), pq)
        const m2 = modMul(b, t, pq)
        return (m1 + m2) % pq
    }
}
