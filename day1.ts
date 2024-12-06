import { Day } from "./tools/day.ts";

type TInput = {
    A: number[] 
    B: number[]
}

export class Day1 extends Day<TInput> {
  constructor() {
    super(1);
  }

  loadInput(): TInput {
    const data =  this.readDataFile();

    const r : TInput = {
      A:[], 
      B:[],
    };

    for(const v of data) {
      const [a, b] = v.split('   ').map(s => +s);
      r.A.push(a);
      r.B.push(b);
    }

    return r;
  }

  part1(input: TInput): number {    
    const A = input.A.sort((a, b) => a-b);
    const B = input.B.sort((a, b) => a-b);

    return A.reduce((r, v, i) => r + Math.abs(v - B[i]), 0);
  }

  part2(input: TInput): number {
    const max = input.B[input.B.length-1];
    const B = new Uint16Array(max+1);
    for(const b of input.B) {
      B[b]++;
    }

    let total = 0;
    for(const k of input.A) {
      total += B[k] * k;
    }
    return total;
  }
}

// new Day1().execute();
