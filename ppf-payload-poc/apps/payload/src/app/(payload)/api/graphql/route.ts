/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { GRAPHQL_POST, REST_OPTIONS } from '@payloadcms/next/routes'
import { NextRequest } from 'next/server';
import { createGzip } from 'zlib'
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Writable } from 'stream';

const pipelineAsync = promisify(pipeline);

async function compressResponse(response: Response): Promise<Response> {
    const gzip = createGzip();
    
    const compressedStream = new ReadableStream({
      async start(controller) {
        const source = response.body as ReadableStream<Uint8Array>;
  
        // @ts-ignore: Next.js fetch body is a WHATWG stream, convert it
      const nodeStream = require('stream').Readable.from(source);
  
        await pipelineAsync(
          nodeStream,
          gzip,
          new Writable({
            write(chunk, _encoding, callback) {
              controller.enqueue(chunk as Uint8Array);
              callback();
            },
            final(callback) {
              controller.close();
              callback();
            },
          })
        );
      },
    });
  
    const headers = new Headers(response.headers);
    headers.set('Content-Encoding', 'gzip');
    headers.set('Content-Type', 'application/json');
  
    return new Response(compressedStream, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
}

export async function POST(req: NextRequest): Promise<Response> {
    const response = await GRAPHQL_POST(config)(req);
    return compressResponse(response);
  }
  
export async function OPTIONS(req: NextRequest, args: {
    params: Promise<{ slug: string[] }>
  }): Promise<Response> {
    const response = await REST_OPTIONS(config)(req, args);
    return compressResponse(response);
}
