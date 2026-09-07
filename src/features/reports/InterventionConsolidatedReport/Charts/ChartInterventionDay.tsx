import { useState, useMemo } from "react";
import { Radio } from "antd";
import dayjs from "dayjs";

import { EChartBase } from "components/EChartBase";
import { STATUS_OPTIONS } from "../options";

interface ChartInterventionDayProps {
  reportData: any;
  isLoading: boolean;
}

type Bucket = Record<string, number>;

const emptyBucket = (): Bucket =>
  Object.fromEntries(STATUS_OPTIONS.map((s) => [s.field, 0]));

export function ChartInterventionDay({
  reportData,
  isLoading,
}: ChartInterventionDayProps) {
  const [groupBy, setGroupBy] = useState<"day" | "month">("month");

  const processedData = useMemo(() => {
    if (!reportData?.days?.length) {
      return { xAxis: [] as string[], series: {} as Record<string, number[]> };
    }

    const grouped: Record<string, Bucket> = {};

    reportData.days.forEach((day: any) => {
      const key =
        groupBy === "day"
          ? day.date.split("-").reverse().join("/")
          : dayjs(day.date).format("MM/YYYY");

      if (!grouped[key]) {
        grouped[key] = emptyBucket();
      }

      STATUS_OPTIONS.forEach((s) => {
        grouped[key][s.field] += day[s.field] || 0;
      });
    });

    const keys = Object.keys(grouped);
    const series: Record<string, number[]> = {};

    STATUS_OPTIONS.forEach((s) => {
      series[s.field] = keys.map((k) => grouped[k][s.field]);
    });

    return { xAxis: keys, series };
  }, [reportData, groupBy]);

  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any[]) => {
        const total = params.reduce(
          (acc, p) => acc + (Number(p.value) || 0),
          0,
        );
        const labels = params
          .filter((p) => Number(p.value) > 0)
          .map(
            (p) =>
              `${p.marker} <strong>${p.seriesName}:</strong> ${Number(
                p.value,
              ).toLocaleString()}`,
          );

        return `${params[0].axisValue}<br/>${labels.join(
          "<br/>",
        )}<br/><strong>Total:</strong> ${total.toLocaleString()}`;
      },
    },
    legend: {
      data: STATUS_OPTIONS.map((s) => s.label),
      bottom: 0,
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    grid: {
      left: "2%",
      right: "3%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: processedData.xAxis,
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: STATUS_OPTIONS.map((s) => ({
      name: s.label,
      type: "bar",
      stack: "total",
      color: s.color,
      emphasis: { focus: "series" },
      data: processedData.series[s.field] || [],
    })),
  };

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <Radio.Group
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="day">Por Dia</Radio.Button>
          <Radio.Button value="month">Por Mês</Radio.Button>
        </Radio.Group>
      </div>

      <EChartBase
        option={chartOptions}
        style={{ height: "40vh", minHeight: "500px" }}
        loading={isLoading}
        settings={{}}
        theme=""
        onClick={() => {}}
      />
    </>
  );
}
