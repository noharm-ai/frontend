export function flatStatuses(obj, result = {}) {
  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      if (typeof obj[property] == "object") {
        if (
          property === "processorStatusSnapshot" ||
          property === "connectionStatusSnapshot"
        ) {
          result[obj[property].id] = obj[property];
        }

        flatStatuses(obj[property], result);
      }
    }
  }
}
