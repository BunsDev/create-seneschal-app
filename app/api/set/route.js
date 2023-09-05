import { NextResponse } from 'next/server';

import Redis from 'ioredis';

const REDIS_CLIENT = new Redis(process.env.UPSTASH_REDIS_URI);

export async function POST(request) {
  try {
    const json = await request.json();

    await REDIS_CLIENT.set(json.commitmentHash, json.ipfsHash);
    let json_response = {
      status: 'success'
    };

    return new NextResponse(JSON.stringify(json_response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.log(err);
    let error_response = {
      status: 'error'
    };
    return new NextResponse(JSON.stringify(error_response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
