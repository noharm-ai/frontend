/**
 * Browser-side export of a custom report, used when the file must carry data
 * that only exists in the page (patient names). The server-generated files
 * stay the default export.
 */

type Row = Record<string, unknown>;

export interface ExportColumn {
  key: string;
  value: (row: Row) => unknown;
}

// rows serialized per step, between which the browser gets the thread back
const CHUNK_ROWS = 2000;

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/* ----------------------------------- CSV ---------------------------------- */

// A cell starting with one of these runs as a formula when the CSV is opened
// in a spreadsheet (CSV injection), so it is prefixed with an apostrophe.
const FORMULA_START = /^[=+@\t\r]/;

const csvCell = (value: unknown): string => {
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  let text = toText(value);
  if (FORMULA_START.test(text)) text = `'${text}`;

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export async function buildCsv(
  rows: Row[],
  columns: ExportColumn[],
): Promise<Blob> {
  // the BOM makes spreadsheets read the file (and its accents) as UTF-8
  const parts: string[] = ["﻿", columns.map((c) => csvCell(c.key)).join(",")];

  for (let start = 0; start < rows.length; start += CHUNK_ROWS) {
    const lines: string[] = [];
    rows.slice(start, start + CHUNK_ROWS).forEach((row) => {
      lines.push(columns.map((c) => csvCell(c.value(row))).join(","));
    });
    parts.push("\r\n" + lines.join("\r\n"));
    await nextTick();
  }

  return new Blob(parts, { type: "text/csv;charset=utf-8" });
}

/* ---------------------------------- XLSX ---------------------------------- */

const MAX_CELL_TEXT = 32767;
// characters XML 1.0 does not allow, even escaped
// eslint-disable-next-line no-control-regex
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

const escapeXml = (text: string) =>
  text
    .replace(INVALID_XML, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const columnName = (index: number) => {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  }
  return name;
};

const xlsxCell = (ref: string, value: unknown, style = 0): string => {
  const s = style ? ` s="${style}"` : "";

  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"${s}><v>${value}</v></c>`;
  }
  if (typeof value === "boolean") {
    return `<c r="${ref}"${s} t="b"><v>${value ? 1 : 0}</v></c>`;
  }

  const text = toText(value).slice(0, MAX_CELL_TEXT);
  if (text === "") return "";

  const space = /^\s|\s$/.test(text) ? ' xml:space="preserve"' : "";
  return `<c r="${ref}"${s} t="inlineStr"><is><t${space}>${escapeXml(text)}</t></is></c>`;
};

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const NS_REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NS_PKG_REL =
  "http://schemas.openxmlformats.org/package/2006/relationships";

const STATIC_FILES = (sheetName: string): [string, string][] => [
  [
    "[Content_Types].xml",
    XML_HEADER +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      "</Types>",
  ],
  [
    "_rels/.rels",
    XML_HEADER +
      `<Relationships xmlns="${NS_PKG_REL}">` +
      `<Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/>` +
      "</Relationships>",
  ],
  [
    "xl/workbook.xml",
    XML_HEADER +
      `<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_REL}"><sheets>` +
      `<sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>` +
      "</sheets></workbook>",
  ],
  [
    "xl/_rels/workbook.xml.rels",
    XML_HEADER +
      `<Relationships xmlns="${NS_PKG_REL}">` +
      `<Relationship Id="rId1" Type="${NS_REL}/worksheet" Target="worksheets/sheet1.xml"/>` +
      `<Relationship Id="rId2" Type="${NS_REL}/styles" Target="styles.xml"/>` +
      "</Relationships>",
  ],
  [
    "xl/styles.xml",
    XML_HEADER +
      `<styleSheet xmlns="${NS_MAIN}">` +
      '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
      '<fills count="2"><fill><patternFill patternType="none"/></fill>' +
      '<fill><patternFill patternType="gray125"/></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      "</styleSheet>",
  ],
];

// sheet names: at most 31 characters, none of []:*?/\
const sheetNameOf = (title: string) =>
  (title.replace(/[[\]:*?/\\]/g, " ").trim() || "Relatorio").slice(0, 31);

/* ----------------------------------- ZIP ---------------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (crc: number, bytes: Uint8Array) => {
  let c = crc ^ 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

interface ZipEntry {
  name: Uint8Array;
  crc: number;
  size: number;
  compressedSize: number;
  method: number;
  offset: number;
}

const concat = (chunks: Uint8Array[]) => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    out.set(chunk, offset);
    offset += chunk.length;
  });
  return out;
};

/** Compresses the chunks (raw deflate) when the browser supports it. */
const deflate = async (
  chunks: Uint8Array[],
): Promise<{ data: Uint8Array; method: number }> => {
  if (typeof CompressionStream === "undefined") {
    return { data: concat(chunks), method: 0 };
  }

  const stream = new Blob(chunks as BlobPart[])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  const data = new Uint8Array(await new Response(stream).arrayBuffer());
  return { data, method: 8 };
};

const dosDateTime = (date: Date) => ({
  time:
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2),
  date:
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate(),
});

async function zip(files: [string, Uint8Array[]][]): Promise<Blob> {
  const encoder = new TextEncoder();
  const { time, date } = dosDateTime(new Date());
  const parts: Uint8Array[] = [];
  const entries: ZipEntry[] = [];
  let offset = 0;

  for (const [fileName, chunks] of files) {
    const name = encoder.encode(fileName);
    const crc = chunks.reduce((value, chunk) => crc32(value, chunk), 0);
    const size = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const { data, method } = await deflate(chunks);

    const header = new DataView(new ArrayBuffer(30));
    header.setUint32(0, 0x04034b50, true);
    header.setUint16(4, 20, true);
    header.setUint16(6, 0x0800, true); // UTF-8 file names
    header.setUint16(8, method, true);
    header.setUint16(10, time, true);
    header.setUint16(12, date, true);
    header.setUint32(14, crc, true);
    header.setUint32(18, data.length, true);
    header.setUint32(22, size, true);
    header.setUint16(26, name.length, true);
    header.setUint16(28, 0, true);

    parts.push(new Uint8Array(header.buffer), name, data);
    entries.push({
      name,
      crc,
      size,
      compressedSize: data.length,
      method,
      offset,
    });
    offset += 30 + name.length + data.length;
  }

  const directoryStart = offset;
  entries.forEach((entry) => {
    const record = new DataView(new ArrayBuffer(46));
    record.setUint32(0, 0x02014b50, true);
    record.setUint16(4, 20, true);
    record.setUint16(6, 20, true);
    record.setUint16(8, 0x0800, true);
    record.setUint16(10, entry.method, true);
    record.setUint16(12, time, true);
    record.setUint16(14, date, true);
    record.setUint32(16, entry.crc, true);
    record.setUint32(20, entry.compressedSize, true);
    record.setUint32(24, entry.size, true);
    record.setUint16(28, entry.name.length, true);
    record.setUint32(42, entry.offset, true);
    parts.push(new Uint8Array(record.buffer), entry.name);
    offset += 46 + entry.name.length;
  });

  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, offset - directoryStart, true);
  end.setUint32(16, directoryStart, true);
  parts.push(new Uint8Array(end.buffer));

  return new Blob(parts as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export async function buildXlsx(
  rows: Row[],
  columns: ExportColumn[],
  title: string,
): Promise<Blob> {
  const encoder = new TextEncoder();
  const refs = columns.map((_, index) => columnName(index));

  const header =
    '<row r="1">' +
    columns.map((c, i) => xlsxCell(`${refs[i]}1`, c.key, 1)).join("") +
    "</row>";
  const sheet: Uint8Array[] = [
    encoder.encode(
      `${XML_HEADER}<worksheet xmlns="${NS_MAIN}"><sheetData>${header}`,
    ),
  ];

  for (let start = 0; start < rows.length; start += CHUNK_ROWS) {
    const lines: string[] = [];
    rows.slice(start, start + CHUNK_ROWS).forEach((row, i) => {
      const r = start + i + 2;
      const cells = columns
        .map((c, j) => xlsxCell(`${refs[j]}${r}`, c.value(row)))
        .join("");
      lines.push(`<row r="${r}">${cells}</row>`);
    });
    sheet.push(encoder.encode(lines.join("")));
    await nextTick();
  }
  sheet.push(encoder.encode("</sheetData></worksheet>"));

  const files: [string, Uint8Array[]][] = STATIC_FILES(sheetNameOf(title)).map(
    ([name, content]) => [name, [encoder.encode(content)]],
  );
  files.push(["xl/worksheets/sheet1.xml", sheet]);

  return zip(files);
}

/* -------------------------------- download -------------------------------- */

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}
