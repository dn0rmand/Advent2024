import { ImageOptions, image } from 'https://deno.land/x/imgcat/iterm.ts';

const encoder = new TextEncoder();

export async function printImage(buffer: Uint8Array, options?: ImageOptions) {
    const encoded = encoder.encode(image(buffer, options));
    const chunksize = 16384;
    const len = Math.ceil(encoded.byteLength / chunksize);
    for (let i = 0; i < len; i++) {
        await Deno.stdout.write(encoded.slice(i * chunksize, (i + 1) * chunksize));
    }
    await Deno.stdout.write(new Uint8Array([10]));
}

export async function printImageFile(filename: string, options?: ImageOptions) {
    const img = await Deno.readFile(filename);
    printImage(img, options);
}
