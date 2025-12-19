// CSV Worker - Handles heavy CSV processing off the main thread
import { isNumber, formatNumber, isInt } from "../utils/number";
import { formatDateTime } from "../utils/date";

const isDate = (value) => {
  // this function is recreated here because a differente behavior in worker context

  if (typeof value !== "string") return false;

  // 1. Define Regex patterns for strict format matching
  const regexDate = /^\d{4}-\d{2}-\d{2}$/;
  const regexDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

  // Strip milliseconds if present (to match your split(".")[0] logic)
  const cleanValue = value.split(".")[0];

  // 2. Check if it matches either format
  const isFormatValid =
    regexDate.test(cleanValue) || regexDateTime.test(cleanValue);
  if (!isFormatValid) return false;

  // 3. Verify the date is "Real" (e.g., exclude Feb 30th)
  const date = new Date(cleanValue);

  // If Date is invalid, it returns NaN for getTime()
  if (isNaN(date.getTime())) return false;

  return true;
};

const replacer = (key, value) => (value === null ? "" : value);

const stringify = (value) => {
  if (Array.isArray(value)) {
    return `"${JSON.stringify(value, replacer).replaceAll('"', "")}"`;
  }

  if (isNumber(value) && !isInt(value)) {
    return JSON.stringify(formatNumber(value, 6));
  }

  if (isDate(value)) {
    return JSON.stringify(formatDateTime(value), replacer);
  }

  return JSON.stringify(value, replacer);
};

// Process CSV data in chunks to avoid blocking
const processChunk = (rows, header, startIndex, chunkSize) => {
  const endIndex = Math.min(startIndex + chunkSize, rows.length);
  const chunk = [];

  for (let i = startIndex; i < endIndex; i++) {
    const row = rows[i];
    const csvRow = header
      .map((fieldName) => stringify(row[fieldName]))
      .join(",");
    chunk.push(csvRow);
  }

  return {
    data: chunk,
    processed: endIndex,
    total: rows.length,
    isComplete: endIndex >= rows.length,
  };
};

// Main worker message handler
self.onmessage = function (e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case "PROCESS_CSV": {
        const { datasource, chunkSize = 1000 } = data;

        if (
          !datasource ||
          !Array.isArray(datasource) ||
          datasource.length === 0
        ) {
          self.postMessage({
            type: "ERROR",
            error: "Invalid or empty datasource provided",
          });
          return;
        }

        const header = Object.keys(datasource[0]);

        // Generate header names
        const headerNames = header.map((k) => {
          // Since we can't access the translation function in the worker,
          // we'll pass the translated headers from the main thread
          return data.translatedHeaders?.[k] || k;
        });

        const csvData = [headerNames.join(",")];
        let processedRows = 0;

        // Process in chunks
        while (processedRows < datasource.length) {
          const result = processChunk(
            datasource,
            header,
            processedRows,
            chunkSize
          );

          csvData.push(...result.data);
          processedRows = result.processed;

          // Send progress update
          self.postMessage({
            type: "PROGRESS",
            processed: result.processed,
            total: result.total,
            percentage: Math.round((result.processed / result.total) * 100),
          });

          // Yield control periodically to prevent blocking
          if (processedRows % (chunkSize * 2) === 0) {
            // Use setTimeout to yield control back to the event loop
            setTimeout(() => {}, 0);
          }
        }

        // Send completed CSV data
        self.postMessage({
          type: "COMPLETE",
          csvData: csvData.join("\r\n"),
        });

        break;
      }

      default:
        self.postMessage({
          type: "ERROR",
          error: `Unknown message type: ${type}`,
        });
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      error: error.message,
    });
  }
};
