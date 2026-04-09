import { useEffect } from "react";
import { Spin } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import AdvancedFilter from "components/AdvancedFilter";
import DefaultModal from "components/Modal";
import {
  fetchExamsRaw,
  resetRaw,
  setRawFilteredStatus,
  setRawFilteredResult,
  setRawFilters,
} from "../../ExamModalSlice";
import { getReportData, IExamRawFilters, IExamRawItem } from "../transformers";
import { ExamsRawMainFilters } from "./ExamsRawMainFilters";

interface IExamsRawFilterProps {
  admissionNumber: number;
  idSegment: number;
  active: boolean;
}

const initialValues: IExamRawFilters = {
  dateRange: [],
  typesList: [],
  valueString: "",
};

export function ExamsRawFilter({
  admissionNumber,
  idSegment,
  active,
}: IExamsRawFilterProps) {
  const dispatch = useAppDispatch();
  const isFetching = useAppSelector(
    (state) => (state as any).examsModal.raw.status === "loading"
  );
  const rawStatus = useAppSelector(
    (state) => (state as any).examsModal.raw.status as string
  );
  const datasource = useAppSelector(
    (state) => (state as any).examsModal.raw.list as IExamRawItem[]
  );

  const search = (params: IExamRawFilters, forceDs?: IExamRawItem[]) => {
    const ds = forceDs || datasource;

    dispatch(setRawFilteredStatus("loading"));
    dispatch(setRawFilters(params));
    const reportData = getReportData(ds, params);
    dispatch(setRawFilteredResult(reportData));

    setTimeout(() => {
      dispatch(setRawFilteredStatus("succeeded"));
    }, 500);
  };

  useEffect(() => {
    if (!active || rawStatus !== "idle") return;

    const fetchData = () => {
      (dispatch((fetchExamsRaw as any)({ admissionNumber, idSegment })) as Promise<any>).then(
        (response: any) => {
          if (response.error) {
            DefaultModal.confirm({
              title: "Não foi possível carregar os exames.",
              content: (
                <>
                  <p>
                    Por favor, tente novamente.
                    <br />
                    Se o problema persistir, entre em contato com a Ajuda.
                  </p>
                </>
              ),
              width: 500,
              okText: "Tentar novamente",
              cancelText: "Fechar",
              onOk: () => fetchData(),
              wrapClassName: "default-modal",
            });
          } else {
            search(
              { ...initialValues, dateRange: [] },
              response.payload.data.data
            );
          }
        }
      );
    };

    fetchData();

    return () => {
      dispatch(resetRaw());
    };
  }, [active]); // eslint-disable-line

  return (
    <Spin spinning={isFetching}>
      {!isFetching && (
        <AdvancedFilter
          initialValues={initialValues}
          mainFilters={<ExamsRawMainFilters />}
          secondaryFilters={null}
          onSearch={search}
          onChangeValues={undefined}
          memoryType={null}
          loading={isFetching}
          skipFilterList={["dateRange", "typesList", "valueString"]}
        />
      )}
    </Spin>
  );
}
