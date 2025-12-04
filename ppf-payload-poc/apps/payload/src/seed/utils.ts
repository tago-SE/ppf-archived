import fs from 'fs/promises';
import path from 'path';
import { File } from 'payload';

export async function loadMediaFile(fileName: string, outputFileName: string, mimetype: string) {
    const pdfBuffer = await fs.readFile(path.join(process.cwd(), `./src/seed/media/${fileName}`));
    const file = {
        name: outputFileName,
        data: Buffer.from(pdfBuffer),
        mimetype,
        size: pdfBuffer.byteLength,
    } as File;

    return file;
}