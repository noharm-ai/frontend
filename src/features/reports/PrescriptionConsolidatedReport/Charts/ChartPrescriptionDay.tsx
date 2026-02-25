import { useState, useMemo } from "react";
import { Radio } from "antd";
import dayjs from "dayjs";
import { EChartBase } from "components/EChartBase";

interface ChartPrescriptionDayProps {
  reportData: any;
  isLoading: boolean;
}

export default function ChartPrescriptionDay({
  reportData,
  isLoading,
}: ChartPrescriptionDayProps) {
  const [groupBy, setGroupBy] = useState<"day" | "month">("day");

  const processedData = useMemo(() => {
    if (!reportData?.days)
      return { xAxis: [], seriesTotal: [], seriesChecked: [] };

    if (groupBy === "day") {
      return {
        xAxis: reportData.days.map((i: any) =>
          i.date.split("-").reverse().join("/"),
        ),
        seriesTotal: reportData.days.map((i: any) => i.total_prescriptions),
        seriesChecked: reportData.days.map(
          (i: any) => i.total_prescriptions_checked,
        ),
      };
    } else {
      const grouped: Record<string, { total: number; checked: number }> = {};

      reportData.days.forEach((i: any) => {
        const month = dayjs(i.date).format("MM/YYYY");
        if (!grouped[month]) {
          grouped[month] = { total: 0, checked: 0 };
        }
        grouped[month].total += i.total_prescriptions;
        grouped[month].checked += i.total_prescriptions_checked;
      });

      const months = Object.keys(grouped);

      return {
        xAxis: months,
        seriesTotal: months.map((m) => grouped[m].total),
        seriesChecked: months.map((m) => grouped[m].checked),
      };
    }
  }, [reportData, groupBy]);

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
      data: ["Prescrições", "Prescrições Checadas"],
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
        boundaryGap: false,
        data: processedData.xAxis,
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        name: "Prescrições",
        type: "line",
        areaStyle: {
          color: "#1e88e5",
          opacity: 0.2,
        },
        color: "#1565c0",
        emphasis: {
          focus: "series",
        },
        data: processedData.seriesTotal,
      },
      {
        name: "Prescrições Checadas",
        type: "line",
        areaStyle: {
          color: "#74b077",
          opacity: 0.5,
        },
        color: "#388e3c",
        emphasis: {
          focus: "series",
        },
        data: processedData.seriesChecked,
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
