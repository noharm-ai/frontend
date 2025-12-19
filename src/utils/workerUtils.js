// Worker Utilities - Helper functions for Web Worker communication

/**
 * Creates and manages a CSV processing worker
 */
export class CSVWorkerManager {
  constructor() {
    this.worker = null;
    this.isProcessing = false;
  }

  /**
   * Initialize the worker
   */
  initWorker() {
    if (!this.worker) {
      // Vite handles worker imports with ?worker suffix
      this.worker = new Worker(
        new URL("../workers/csvWorker.js", import.meta.url),
        { type: "module" }
      );
    }
    return this.worker;
  }

  /**
   * Process CSV data using Web Worker
   * @param {Array} datasource - The data to convert to CSV
   * @param {Object} translatedHeaders - Header names
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Promise that resolves to CSV string
   */
  async processCSV(datasource, translatedHeaders, options = {}) {
    if (this.isProcessing) {
      throw new Error("CSV processing already in progress");
    }

    return new Promise((resolve, reject) => {
      this.isProcessing = true;
      const worker = this.initWorker();

      const messageHandler = (e) => {
        const { type, data, error, csvData, processed, total, percentage } =
          e.data;

        switch (type) {
          case "PROGRESS":
            // Optional progress callback
            if (options.onProgress) {
              options.onProgress({ processed, total, percentage });
            }
            break;

          case "COMPLETE":
            this.isProcessing = false;
            worker.removeEventListener("message", messageHandler);
            worker.removeEventListener("error", errorHandler);
            resolve(csvData);
            break;

          case "ERROR":
            this.isProcessing = false;
            worker.removeEventListener("message", messageHandler);
            worker.removeEventListener("error", errorHandler);
            reject(new Error(error || "Unknown worker error"));
            break;

          default:
            console.warn("Unknown message type from worker:", type);
        }
      };

      const errorHandler = (error) => {
        this.isProcessing = false;
        worker.removeEventListener("message", messageHandler);
        worker.removeEventListener("error", errorHandler);
        reject(new Error(`Worker error: ${error.message}`));
      };

      worker.addEventListener("message", messageHandler);
      worker.addEventListener("error", errorHandler);

      // Send data to worker
      worker.postMessage({
        type: "PROCESS_CSV",
        data: {
          datasource,
          translatedHeaders,
          chunkSize: options.chunkSize || 1000,
        },
      });
    });
  }

  /**
   * Terminate the worker
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isProcessing = false;
  }

  /**
   * Check if Web Workers are supported
   */
  static isSupported() {
    return typeof Worker !== "undefined";
  }
}

// Singleton instance for global use
let csvWorkerManager = null;

/**
 * Get or create the CSV worker manager instance
 */
export const getCSVWorkerManager = () => {
  if (!csvWorkerManager) {
    csvWorkerManager = new CSVWorkerManager();
  }
  return csvWorkerManager;
};

/**
 * Clean up worker resources
 */
export const cleanupCSVWorker = () => {
  if (csvWorkerManager) {
    csvWorkerManager.terminate();
    csvWorkerManager = null;
  }
};
