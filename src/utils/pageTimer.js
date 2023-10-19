import ifvisible from "ifvisible.js";

const pageTimer = ({ debug = false }) => {
  let currentTime = 0;
  let interval = null;

  const start = () => {
    clearInterval(interval?.code);

    interval = ifvisible.onEvery(1, () => {
      currentTime += 1;
      if (debug) {
        console.log("pagetimer", currentTime);
      }
    });
  };

  const stop = () => {
    clearInterval(interval?.code);
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
