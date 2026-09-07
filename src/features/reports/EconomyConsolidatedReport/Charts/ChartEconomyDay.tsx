import { useState, useMemo } from "react";
import { Radio } from "antd";
import dayjs from "dayjs";

import { EChartBase } from "components/EChartBase";
import { formatCurrency } from "utils/number";
import { ECONOMY_TYPE_COLORS } from "../options";

interface ChartEconomyDayProps {
  reportData: any;
  isLoading: boolean;
}

type Bucket = { suspension: number; substitution: number; custom: number };

const emptyBucket = (): Bucket => ({
  suspension: 0,
  substitution: 0,
  custom: 0,
});

const addDay = (bucket: Bucket, day: any) => {
  bucket.suspension += day.total_economy_suspension || 0;
  bucket.substitution += day.total_economy_substitution || 0;
  bucket.custom += day.total_economy_custom || 0;
};

export default function ChartEconomyDay({
  reportData,
  isLoading,
}: ChartEconomyDayProps) {
  const [groupBy, setGroupBy] = useState<"day" | "month">("month");

  const processedData = useMemo(() => {
    const empty = {
      xAxis: [] as string[],
      suspension: [] as number[],
      substitution: [] as number[],
      custom: [] as number[],
    };

    if (!reportData?.days?.length) return empty;

    const grouped: Record<string, Bucket> = {};

    reportData.days.forEach((day: any) => {
      const key =
        groupBy === "day"
          ? day.date.split("-").reverse().join("/")
          : dayjs(day.date).format("MM/YYYY");

      if (!grouped[key]) {
        grouped[key] = emptyBucket();
      }

      addDay(grouped[key], day);
    });

    const keys = Object.keys(grouped);

    return {
      xAxis: keys,
      suspension: keys.map((k) => Number(grouped[k].suspension.toFixed(2))),
      substitution: keys.map((k) => Number(grouped[k].substitution.toFixed(2))),
      custom: keys.map((k) => Number(grouped[k].custom.toFixed(2))),
    };
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
        const labels = params.map(
          (p) =>
            `${p.marker} <strong>${p.seriesName}:</strong> R$ ${formatCurrency(
              p.value,
            )}`,
        );

        return `${params[0].axisValue}<br/>${labels.join(
          "<br/>",
        )}<br/><strong>Total:</strong> R$ ${formatCurrency(total)}`;
      },
    },
    legend: {
      data: ["Suspensão", "Substituição", "Customizada"],
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
        axisLabel: {
          formatter: (value: number) => `R$ ${formatCurrency(value, 0)}`,
        },
      },
    ],
    series: [
      {
        name: "Suspensão",
        type: "bar",
        stack: "total",
        color: ECONOMY_TYPE_COLORS.suspension,
        emphasis: { focus: "series" },
        data: processedData.suspension,
      },
      {
        name: "Substituição",
        type: "bar",
        stack: "total",
        color: ECONOMY_TYPE_COLORS.substitution,
        emphasis: { focus: "series" },
        data: processedData.substitution,
      },
      {
        name: "Customizada",
        type: "bar",
        stack: "total",
        color: ECONOMY_TYPE_COLORS.custom,
        emphasis: { focus: "series" },
        data: processedData.custom,
      },
    ],
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
