/**
 * Core types for MusicXML parsing
 */

/**
 * MusicXML version information
 */
export type MusicXMLVersion = {
  major: number;
  minor: number;
};

/**
 * MusicXML summary information
 */
export type MusicXMLSummary = {
  title?: string;
  composer?: string;
  opus?: string;
  movement?: string;
  parts: PartInfo[];
  measureCount: number;
};

/**
 * Information about a part in the MusicXML file
 */
export type PartInfo = {
  id: string;
  name?: string;
  abbreviation?: string;
};

/**
 * Measure position information
 */
export type MeasurePosition = {
  number: string;
  partId: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

/**
 * Result of parsing a MusicXML file
 */
export type MusicXMLParseResult = {
  version: MusicXMLVersion;
  summary: MusicXMLSummary;
  measurePositions: MeasurePosition[];
};
