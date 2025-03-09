/**
 * MusicXML parser module
 */
import { err, ok, Result, XMLParser } from "../../deps.ts";
import {
  MeasurePosition,
  MusicXMLParseResult,
  MusicXMLSummary,
  MusicXMLVersion,
  PartInfo,
} from "./types.ts";

/**
 * Error types for MusicXML parsing
 */
export type MusicXMLParseError =
  | { type: "file_read_error"; message: string }
  | { type: "invalid_xml"; message: string }
  | { type: "not_musicxml"; message: string };

/**
 * Parse a MusicXML file and extract information
 *
 * @param filePath Path to the MusicXML file
 * @returns Result containing either the parsed MusicXML data or an error
 */
export async function parseMusicXMLFile(
  filePath: string,
): Promise<Result<MusicXMLParseResult, MusicXMLParseError>> {
  try {
    // Read the file content
    const fileContent = await Deno.readTextFile(filePath);
    return parseMusicXMLContent(fileContent);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return err({
      type: "file_read_error",
      message: `Failed to read file: ${errorMessage}`,
    });
  }
}

/**
 * Parse MusicXML content from a string
 *
 * @param content MusicXML content as string
 * @returns Result containing either the parsed MusicXML data or an error
 */
export function parseMusicXMLContent(
  content: string,
): Result<MusicXMLParseResult, MusicXMLParseError> {
  try {
    // Configure the XML parser
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (name) => {
        // Elements that should always be treated as arrays even when there's only one
        return ["part", "measure", "score-part"].includes(name);
      },
    });

    // Parse XML content
    const result = parser.parse(content);

    // Check if it's a MusicXML file by looking for score-partwise element
    if (!result["score-partwise"]) {
      return err({
        type: "not_musicxml",
        message: "Not a valid MusicXML file (missing score-partwise element)",
      });
    }

    // Use the score-partwise element as our root for extraction
    const rootElement = result["score-partwise"];

    // Extract version
    const version = extractVersion(rootElement);

    // Extract summary information
    const summary = extractSummary(rootElement);

    // Extract measure positions
    const measurePositions = extractMeasurePositions(rootElement);

    return ok({
      version,
      summary,
      measurePositions,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return err({
      type: "invalid_xml",
      message: `Failed to parse XML: ${errorMessage}`,
    });
  }
}

/**
 * Extract MusicXML version from the root element
 */
function extractVersion(rootElement: any): MusicXMLVersion {
  const versionAttr = rootElement["@_version"] || "4.0";
  const [major, minor] = versionAttr.split(".").map(Number);

  return {
    major: major || 4,
    minor: minor || 0,
  };
}

/**
 * Extract summary information from the MusicXML document
 */
function extractSummary(rootElement: any): MusicXMLSummary {
  // Extract title (either from work-title or movement-title)
  let title: string | undefined;
  if (rootElement.work && rootElement.work["work-title"]) {
    title = rootElement.work["work-title"];
  } else if (rootElement["movement-title"]) {
    title = rootElement["movement-title"];
  }

  // Extract composer
  let composer: string | undefined;
  if (rootElement.identification && rootElement.identification.creator) {
    const creators = Array.isArray(rootElement.identification.creator)
      ? rootElement.identification.creator
      : [rootElement.identification.creator];

    const composerCreator = creators.find(
      (c: any) => c["@_type"] === "composer",
    );
    composer = composerCreator ? composerCreator["#text"] : undefined;
  }

  // Extract opus
  let opus: string | undefined;
  if (rootElement.work && rootElement.work.opus) {
    opus = rootElement.work.opus;
  }

  // Extract movement
  const movement = rootElement["movement-number"];

  // Extract parts
  const parts: PartInfo[] = [];
  if (rootElement["part-list"] && rootElement["part-list"]["score-part"]) {
    rootElement["part-list"]["score-part"].forEach((partElement: any) => {
      parts.push({
        id: partElement["@_id"] || "",
        name: partElement["part-name"] || undefined,
        abbreviation: partElement["part-abbreviation"] || undefined,
      });
    });
  }

  // Count measures (using the first part as reference)
  let measureCount = 0;
  if (rootElement.part && rootElement.part.length > 0) {
    measureCount = rootElement.part[0].measure?.length || 0;
  }

  return {
    title,
    composer,
    opus,
    movement,
    parts,
    measureCount,
  };
}

/**
 * Extract measure positions from the MusicXML document
 * Note: In a real implementation, this would require rendering the MusicXML
 * to determine actual positions. This is a placeholder implementation.
 */
function extractMeasurePositions(rootElement: any): MeasurePosition[] {
  const positions: MeasurePosition[] = [];

  // This is a placeholder implementation since actual positions would require rendering
  if (rootElement.part) {
    rootElement.part.forEach((partElement: any, partIndex: number) => {
      const partId = partElement["@_id"] || `Part${partIndex + 1}`;

      if (partElement.measure) {
        partElement.measure.forEach(
          (measureElement: any, measureIndex: number) => {
            const number = measureElement["@_number"] || `${measureIndex + 1}`;

            // Placeholder values - in a real implementation, these would be calculated
            // based on rendering the MusicXML
            positions.push({
              number,
              partId,
              top: partIndex * 100,
              left: measureIndex * 200,
              width: 200,
              height: 100,
            });
          },
        );
      }
    });
  }

  return positions;
}
