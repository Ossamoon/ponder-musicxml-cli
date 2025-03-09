import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { MusicXMLParseError, parseMusicXMLContent } from "./parser.ts";
import { MeasurePosition, MusicXMLParseResult } from "./types.ts";

// Sample MusicXML content for testing
const sampleMusicXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>Test Composition</work-title>
    <opus>Op. 1</opus>
  </work>
  <identification>
    <creator type="composer">Test Composer</creator>
  </identification>
  <movement-number>1</movement-number>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
      <part-abbreviation>Pno.</part-abbreviation>
    </score-part>
    <score-part id="P2">
      <part-name>Violin</part-name>
      <part-abbreviation>Vln.</part-abbreviation>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <note>
        <pitch>
          <step>E</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

// Invalid XML for testing error handling
const invalidXML = `<?xml version="1.0" encoding="UTF-8"?>
<invalid-root>
  <broken-xml>
</invalid-root>`;

// Valid XML but not MusicXML
const nonMusicXML = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <element>This is not MusicXML</element>
</root>`;

test("parseMusicXMLContent should parse valid MusicXML content", () => {
  const result = parseMusicXMLContent(sampleMusicXML);

  expect(result.isOk()).toBe(true);

  if (result.isOk()) {
    const data = result._unsafeUnwrap();

    // Test version extraction
    expect(data.version.major).toBe(4);
    expect(data.version.minor).toBe(0);

    // Test summary extraction
    expect(data.summary.title).toBe("Test Composition");
    expect(data.summary.composer).toBe("Test Composer");
    expect(data.summary.opus).toBe("Op. 1");
    expect(data.summary.movement).toBe(1);
    expect(data.summary.measureCount).toBe(2);

    // Test parts extraction
    expect(data.summary.parts.length).toBe(2);
    expect(data.summary.parts[0].id).toBe("P1");
    expect(data.summary.parts[0].name).toBe("Piano");
    expect(data.summary.parts[0].abbreviation).toBe("Pno.");
    expect(data.summary.parts[1].id).toBe("P2");
    expect(data.summary.parts[1].name).toBe("Violin");
    expect(data.summary.parts[1].abbreviation).toBe("Vln.");

    // Test measure positions extraction
    expect(data.measurePositions.length).toBe(4);

    // Check first part, first measure
    const firstMeasure = data.measurePositions.find(
      (m: MeasurePosition) => m.partId === "P1" && m.number === "1",
    );
    expect(firstMeasure).toBeDefined();
    if (firstMeasure) {
      expect(firstMeasure.top).toBe(0);
      expect(firstMeasure.left).toBe(0);
    }

    // Check second part, second measure
    const lastMeasure = data.measurePositions.find(
      (m: MeasurePosition) => m.partId === "P2" && m.number === "2",
    );
    expect(lastMeasure).toBeDefined();
    if (lastMeasure) {
      expect(lastMeasure.top).toBe(100);
      expect(lastMeasure.left).toBe(200);
    }
  }
});

test("parseMusicXMLContent should handle invalid XML", () => {
  const result = parseMusicXMLContent(invalidXML);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    const error = result._unsafeUnwrapErr();
    expect(error.type).toBe("not_musicxml");
    expect(error.message).toContain("missing score-partwise element");
  }
});

test("parseMusicXMLContent should handle non-MusicXML content", () => {
  const result = parseMusicXMLContent(nonMusicXML);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    const error = result._unsafeUnwrapErr();
    expect(error.type).toBe("not_musicxml");
    expect(error.message).toContain("missing score-partwise element");
  }
});

test("parseMusicXMLContent should handle empty content", () => {
  const result = parseMusicXMLContent("");

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    const error = result._unsafeUnwrapErr();
    expect(error.type).toBe("not_musicxml");
  }
});
