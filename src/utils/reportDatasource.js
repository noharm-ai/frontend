import { decompressDatasource } from "utils/report";

// Cached report datasets are kept here, outside Redux: they can be tens of MB
// and Redux DevTools / redux-logger serialize and retain every action payload.
// Only the gzipped blob is kept long term; it is decompressed on demand.
const datasources = new Map();

export const loadReportDatasource = async (reportKey, url) => {
  const cacheResponseStream = await fetch(url);
  const gzipped = await cacheResponseStream.clone().blob();

  const cacheReadableStream = cacheResponseStream.body.pipeThrough(
    new window.DecompressionStream("gzip"),
  );

  const decompressedResponse = new Response(cacheReadableStream);
  const cache = await decompressedResponse.json();

  datasources.set(reportKey, { gzipped, body: cache.body });

  return cache;
};

// Hands over the body parsed by the last load and releases it, so the first
// search does not decompress the file a second time.
export const takeLoadedReportBody = (reportKey) => {
  const entry = datasources.get(reportKey);
  if (!entry) return [];

  const { body } = entry;
  entry.body = null;

  return body;
};

export const getReportDatasource = async (reportKey) => {
  const entry = datasources.get(reportKey);
  if (!entry) return [];

  return decompressDatasource(entry.gzipped);
};

export const clearReportDatasource = (reportKey) => {
  datasources.delete(reportKey);
};
