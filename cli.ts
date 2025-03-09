#!/usr/bin/env deno run --allow-read --allow-write

/**
 * MusicXML CLI entry point
 */
import { parseArgs } from "./modules/cli/mod.ts";

// Parse command line arguments and execute the appropriate command
parseArgs(Deno.args);
