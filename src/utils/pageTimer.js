import ifvisible from "ifvisible.js";

const pageTimer = ({ debug = false }) => {
  let currentTime = 0;
  let timer = null;

  const start = () => {
    timer?.stop();

    timer = ifvisible.onEvery(1, () => {
      currentTime += 1;
      if (debug) {
        console.debug("pagetimer", currentTime);
      }
    });
  };

  const stop = () => {
    timer?.stop();
    timer = null;
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
