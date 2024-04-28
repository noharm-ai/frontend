import React, { useRef, useEffect, useState } from "react";
import { init, getInstanceByDom } from "echarts";

export function EChartBase({
  option,
  style,
  settings,
  loading,
  theme,
  onClick,
}) {
  const chartRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    // Initialize chart
    let chart;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }

    // Add chart resize listener
    // ResizeObserver is leading to a bit janky UX
    function resizeChart() {
      chart?.resize();
    }

    function setPrintMode() {
      setImgUrl(chart.getDataURL());
    }

    function setWebMode() {
      setImgUrl(null);
    }

    window.addEventListener("resize", resizeChart);
    window.addEventListener("onbeforeprint", setPrintMode);
    window.addEventListener("onafterprint", setWebMode);

    if (onClick) {
      chart.on("click", onClick);
    }

    // Return cleanup function
    return () => {
      chart?.dispose();
      window.removeEventListener("resize", resizeChart);
      window.removeEventListener("onbeforeprint", setPrintMode);
      window.removeEventListener("onafterprint", setWebMode);
    };
  }, [theme, onClick]);

  useEffect(() => {
    const defaultOptions = {};

    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart.setOption({ ...defaultOptions, ...option }, settings);
    }
  }, [option, settings, theme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      loading === true
        ? chart.showLoading({
            text: "Carregando",
          })
        : chart.hideLoading();
    }
  }, [loading, theme]);

  return (
    <>
      {imgUrl && <img src={imgUrl} style={{ width: "100%" }} alt="Gráfico" />}
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "100px",
          display: imgUrl ? "none" : "block",
          ...style,
        }}
      />
    </>
  );
}
