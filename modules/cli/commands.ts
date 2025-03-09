/**
 * CLI commands for MusicXML processing
 */
import {
  MeasurePosition,
  MusicXMLParseError,
  MusicXMLParseResult,
  parseMusicXMLFile,
} from "../core/mod.ts";
import { join, parse, Result } from "../../deps.ts";

/**
 * Command to get MusicXML version
 */
export async function getVersion(filePath: string): Promise<void> {
  const result = await parseMusicXMLFile(filePath);

  result.match(
    (data) => {
      console.log(
        `MusicXML Version: ${data.version.major}.${data.version.minor}`,
      );
    },
    (error) => {
      console.error(`Error: ${error.message}`);
      Deno.exit(1);
    },
  );
}

/**
 * Command to get MusicXML summary
 */
export async function getSummary(filePath: string): Promise<void> {
  const result = await parseMusicXMLFile(filePath);

  result.match(
    (data) => {
      const summary = data.summary;

      console.log("MusicXML Summary:");
      console.log("-----------------");
      console.log(`Title: ${summary.title || "N/A"}`);
      console.log(`Composer: ${summary.composer || "N/A"}`);
      console.log(`Opus: ${summary.opus || "N/A"}`);
      console.log(`Movement: ${summary.movement || "N/A"}`);
      console.log(`Measure Count: ${summary.measureCount}`);

      console.log("\nParts:");
      summary.parts.forEach((part) => {
        console.log(`- ${part.name || part.id} (${part.id})`);
      });
    },
    (error) => {
      console.error(`Error: ${error.message}`);
      Deno.exit(1);
    },
  );
}

/**
 * Command to export measure positions to CSV
 */
export async function exportMeasurePositions(
  filePath: string,
  outputPath?: string,
): Promise<void> {
  const result = await parseMusicXMLFile(filePath);

  result.match(
    (data) => {
      const positions = data.measurePositions;
      const csvContent = formatPositionsAsCsv(positions);

      if (outputPath) {
        Deno.writeTextFileSync(outputPath, csvContent);
        console.log(`Measure positions exported to ${outputPath}`);
      } else {
        // If no output path is provided, use the input file name with .csv extension
        const defaultOutputPath = filePath.replace(/\.[^/.]+$/, "") +
          "_measures.csv";
        Deno.writeTextFileSync(defaultOutputPath, csvContent);
        console.log(`Measure positions exported to ${defaultOutputPath}`);
      }
    },
    (error) => {
      console.error(`Error: ${error.message}`);
      Deno.exit(1);
    },
  );
}

/**
 * Format measure positions as CSV
 */
function formatPositionsAsCsv(positions: MeasurePosition[]): string {
  const header = "measure_number,part_id,top,left,width,height";
  const rows = positions.map((pos) =>
    `${pos.number},${pos.partId},${pos.top},${pos.left},${pos.width},${pos.height}`
  );

  return [header, ...rows].join("\n");
}

/**
 * Parse command line arguments and execute the appropriate command
 */
export function parseArgs(args: string[]): void {
  const parsedArgs = parse(args, {
    string: ["output", "o"],
    boolean: ["help", "h", "version", "v"],
    alias: {
      h: "help",
      v: "version",
      o: "output",
    },
  });

  const command = parsedArgs._[0] as string;
  const filePath = parsedArgs._[1] as string;

  if (parsedArgs.help) {
    showHelp();
    return;
  }

  if (parsedArgs.version) {
    console.log("Ponder MusicXML CLI v0.1.0");
    return;
  }

  if (!command) {
    console.error("Error: No command specified");
    showHelp();
    Deno.exit(1);
  }

  if (!filePath) {
    console.error("Error: No MusicXML file specified");
    showHelp();
    Deno.exit(1);
  }

  executeCommand(command, filePath, parsedArgs);
}

/**
 * Execute the specified command
 */
async function executeCommand(
  command: string,
  filePath: string,
  args: Record<string, unknown>,
): Promise<void> {
  switch (command) {
    case "version":
      await getVersion(filePath);
      break;
    case "summary":
      await getSummary(filePath);
      break;
    case "measures":
      await exportMeasurePositions(filePath, args.output as string);
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      showHelp();
      Deno.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(`
Ponder MusicXML CLI

Usage:
  pmxl <command> <file> [options]

Commands:
  version     Get MusicXML version
  summary     Get MusicXML summary information
  measures    Export measure positions to CSV

Options:
  -h, --help     Show help information
  -v, --version  Show version information
  -o, --output   Specify output file path (for measures command)

Examples:
  pmxl version example.musicxml
  pmxl summary example.musicxml
  pmxl measures example.musicxml -o positions.csv
`);
}
