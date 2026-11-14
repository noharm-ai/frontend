import ifvisible from "ifvisible.js";

// ifvisible.js 1.x considered the user idle after 60s without activity; 3.x
// defaults to 30s. Keep the 60s so the measured time stays comparable.
ifvisible.setIdleDuration(60);

const pageTimer = ({ debug = false }) => {
  let currentTime = 0;
  let interval = null;

  const start = () => {
    interval?.stop();

    interval = ifvisible.onEvery(1, () => {
      currentTime += 1;
      if (debug) {
        console.debug("pagetimer", currentTime);
      }
    });
  };

  const stop = () => {
    interval?.stop();
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
