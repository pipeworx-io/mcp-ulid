interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ULID MCP.
 *
 * Keyless, offline: generate ULIDs (Universally Unique Lexicographically
 * Sortable IDs — 48-bit ms timestamp + 80-bit randomness, Crockford Base32)
 * and parse one back to its timestamp. Uses the platform crypto — no API, no key.
 */


const C = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford Base32 (no I,L,O,U)
const RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i;

function encodeTime(ms: number): string {
  let s = '';
  for (let i = 0; i < 10; i++) { s = C[ms % 32] + s; ms = Math.floor(ms / 32); }
  return s;
}
function randomPart(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let s = '';
  for (const b of bytes) s += C[b & 31];
  return s;
}
function decodeTime(t: string): number {
  let ms = 0;
  for (const ch of t.toUpperCase()) { const i = C.indexOf(ch); if (i < 0) return NaN; ms = ms * 32 + i; }
  return ms;
}

const tools: McpToolExport['tools'] = [
  {
    name: 'generate_ulid',
    description: 'Generate one or more ULIDs (time-sortable unique IDs). Each is a 26-char Crockford Base32 string whose first 10 chars encode the creation time.',
    inputSchema: { type: 'object', properties: { count: { type: 'number', description: 'How many to generate (1-100, default 1).' } } },
  },
  {
    name: 'parse_ulid',
    description: 'Validate a ULID and extract its embedded creation timestamp (ISO date + epoch ms) and the random component. Keyless, offline.',
    inputSchema: { type: 'object', properties: { ulid: { type: 'string', description: 'A 26-character ULID.' } }, required: ['ulid'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'generate_ulid': {
      const count = Math.max(1, Math.min(100, typeof args.count === 'number' ? args.count : 1));
      const now = Date.now();
      const ulids = Array.from({ length: count }, () => encodeTime(now) + randomPart());
      return count === 1 ? { ulid: ulids[0], timestamp: new Date(now).toISOString() } : { count, ulids };
    }
    case 'parse_ulid': {
      const ulid = reqStr(args, 'ulid', '"01ARZ3NDEKTSV4RRFFQ69G5FAV"').trim();
      if (ulid.length !== 26 || !RE.test(ulid)) return { input: ulid, valid: false, reason: 'Not a well-formed 26-character Crockford Base32 ULID.' };
      const ms = decodeTime(ulid.slice(0, 10));
      if (!Number.isFinite(ms)) return { input: ulid, valid: false, reason: 'Invalid Base32 in the timestamp portion.' };
      return { input: ulid, valid: true, timestamp: new Date(ms).toISOString(), epoch_ms: ms, randomness: ulid.slice(10) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, ex: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${ex}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
