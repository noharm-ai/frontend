import { useState, useEffect } from "react";
import { Spin, notification } from "antd";
import { useParams } from "react-router-dom";

import { useAppDispatch } from "src/store";
import { DataViewer } from "src/components/DataViewer/DataViewer";
import { NoHarmLogoHorizontal as Brand } from "src/assets/NoHarmLogoHorizontal";
import { formatDate } from "src/utils/date";
import { getFileReport } from "../ReportsSlice";

import { CustomHeaderContainer } from "./FileReport.style";
import "styles/base.css";

export function FileReport() {
  const dispatch = useAppDispatch();
  const { type, id_report, filename } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dispatch(
          /* @ts-expect-error legacy code */
          getFileReport({ type, id_report, filename: `${filename}.json.gz` }),
        );

        const cacheResponseStream = await fetch(response.payload.data.data.url);

        const cacheReadableStream = cacheResponseStream.body?.pipeThrough(
          new window.DecompressionStream("gzip"),
        );

        const decompressedResponse = new Response(cacheReadableStream);
        const cache = await decompressedResponse.json();

        setData(cache);
        setTitle(response.payload.data.data.title);
      } catch (err) {
        console.error(err);
        notification.error({
          message: "Erro ao buscar relatório",
          description: "Não foi possível buscar o relatório.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, id_report, filename, dispatch]);

  return (
    <>
      <Spin spinning={isLoading}>
        <CustomHeaderContainer>
          <div className="header-content">
            <h1>Relatório: {title}</h1>
            <div className="header-subtitle">{formatDate(filename)}</div>
          </div>
          <div className="brand-container">
            <Brand />
          </div>
        </CustomHeaderContainer>
        <div style={{ padding: "1rem" }}>
          <DataViewer data={data} onRowClick={() => {}} />
        </div>
      </Spin>
    </>
  );
}
