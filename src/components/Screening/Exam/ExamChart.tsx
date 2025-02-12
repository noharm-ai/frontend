import { EChartBase } from "components/EChartBase";

interface IExamChartProps {
  isLoading: boolean;
  reportData: {
    days: string[];
    max: number[];
    min: number[];
    results: number[];
    unit: string;
  };
}

export function ExamChart({ isLoading, reportData }: IExamChartProps) {
  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      data: ["Máximo", "Mínimo", reportData?.unit],
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    grid: {
      left: "2%",
      right: "3%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: reportData?.days || [],
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        name: "Máximo",
        type: "line",

        color: "#d9363e",
        emphasis: {
          focus: "series",
        },
        data: reportData?.max ? reportData.max : [],
      },
      {
        name: "Mínimo",
        type: "line",

        color: "#d9363e",
        emphasis: {
          focus: "series",
        },
        data: reportData?.min ? reportData.min : [],
      },
      {
        name: reportData?.unit,
        type: "line",
        areaStyle: {
          color: "#1e88e5",
          opacity: 0.2,
        },
        color: "#1565c0",
        emphasis: {
          focus: "series",
        },
        data: reportData?.results ? reportData.results : [],
      },
    ],
  };

  return (
    <EChartBase
      option={chartOptions}
      style={{ height: "40vh", minHeight: "500px" }}
      loading={isLoading}
    />
  );
}
