/**
 * Cross-platform base64 helpers for React Native (iOS/Android) and web.
 * Uses the base-64 package on all platforms so encrypt/decrypt round-trip
 * is identical everywhere (avoids atob/btoa being missing or different on web).
 */
/// <reference path="./base64.d.ts" />

import { decode as base64Decode, encode as base64Encode } from 'base-64';

/** Decode base64 string to Uint8Array. Works on web, iOS, and Android. */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = base64Decode(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/** Encode Uint8Array to base64 string. Works on web, iOS, and Android. */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  const len = bytes.byteLength;
  if (len === 0) return base64Encode('');
  const chunkSize = 8192;
  const chunks: string[] = [];
  for (let i = 0; i < len; i += chunkSize) {
    const end = Math.min(i + chunkSize, len);
    const chunk: string[] = [];
    for (let j = i; j < end; j++) {
      chunk.push(String.fromCharCode(bytes[j] & 0xff));
    }
    chunks.push(chunk.join(''));
  }
  return base64Encode(chunks.join(''));
}
