/**
 * External dependencies
 */

// Deno standard library
export { parse } from "https://deno.land/std@0.190.0/flags/mod.ts";
export { join } from "https://deno.land/std@0.190.0/path/mod.ts";

// XML parsing
export { XMLParser } from "npm:fast-xml-parser@^4.3.5";

// Result type for error handling
export { err, ok, Result } from "npm:neverthrow@^8.2.0";
