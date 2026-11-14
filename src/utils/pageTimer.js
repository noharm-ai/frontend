import ifvisible from "ifvisible.js";

// Seconds without activity before the user counts as idle. ifvisible.js 1.x
// used 60s; 3.x defaults to 30s. Keep 60s so the measured time stays
// comparable with what was recorded before the upgrade.
const IDLE_SECONDS = 60;

const pageTimer = ({ debug = false }) => {
  let currentTime = 0;
  let interval = null;

  // A plain interval that skips ticks while the page is hidden or the user is
  // idle, as ifvisible.js 1.x did. ifvisible's own onEvery() is avoided on
  // purpose: in 3.x it starts counting regardless of the current status,
  // restarts the interval (dropping the partial second) on every wakeup, and
  // registers a statusChanged listener that stop() never removes.
  const start = () => {
    clearInterval(interval);
    // setIdleDuration() restarts ifvisible's idle timer (waking an idle
    // user), so only call it the first time, when the 30s default is set.
    if (ifvisible.getIdleDuration() !== IDLE_SECONDS * 1000) {
      ifvisible.setIdleDuration(IDLE_SECONDS);
    }

    interval = setInterval(() => {
      if (!ifvisible.now()) return;

      currentTime += 1;
      if (debug) {
        console.debug("pagetimer", currentTime);
      }
    }, 1000);
  };

  const stop = () => {
    clearInterval(interval);
    interval = null;
    currentTime = 0;
  };

  const reset = () => {
    currentTime = 0;
  };

  const getCurrentTime = () => {
    return currentTime;
  };

  return {
    start,
    stop,
    reset,
    getCurrentTime,
  };
};

export default pageTimer;
