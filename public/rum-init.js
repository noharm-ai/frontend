function isLocalStorageEnabled() {
  try {
    const testKey = "__test_localStorage__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

(function (n, i, v, r, s, c, u, x, z) {
  x = window.AwsRumClient = { q: [], n: n, i: i, v: v, r: r, c: c, u: u };
  window[n] = function (c, p) {
    x.q.push({ c: c, p: p });
  };
  z = document.createElement("script");
  z.async = true;
  z.src = s;
  document.head.insertBefore(z, document.getElementsByTagName("script")[0]);
})(
  "cwr",
  "76733ed1-1445-4f80-8e41-2f824a752c39",
  "1.0.0",
  "sa-east-1",
  "/cwr.js", // https://client.rum.us-east-1.amazonaws.com/1.18.0/cwr.js
  {
    sessionSampleRate: 1,
    identityPoolId: "sa-east-1:45bad581-042d-4680-91e2-972f4074372d",
    endpoint: "https://dataplane.rum.sa-east-1.amazonaws.com",
    telemetries: [
      [
        "errors",
        {
          ignore: (errorEvent) => {
            if (
              errorEvent &&
              errorEvent.reason &&
              (/^Request failed with status code 401/.test(
                errorEvent.reason.message,
              ) ||
                /^Network Error/.test(errorEvent.reason.message))
            ) {
              return true;
            }

            return (
              errorEvent &&
              errorEvent.message &&
              (/^Request failed with status code 401/.test(
                errorEvent.message,
              ) ||
                /^Network Error/.test(errorEvent.message))
            );
          },
        },
      ],
      "http",
    ],
    allowCookies: true,
    enableXRay: false,
    sessionAttributes: {
      applicationVersion:
        document.querySelector('meta[name="app-version"]')?.content ||
        "unknown",
      schema: isLocalStorageEnabled()
        ? localStorage.getItem("schema") || "indefinido"
        : "inacessivel",
    },
  },
);
