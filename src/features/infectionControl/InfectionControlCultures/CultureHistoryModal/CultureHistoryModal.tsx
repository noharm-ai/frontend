import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Table } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";

import {
  closeCultureHistory,
  fetchCultureHistory,
} from "../../InfectionControlSlice";
import { cultureColumns } from "../cultureColumns";
import { CulturesBox, CulturesError } from "../InfectionControlCultures.style";
import { HistoryBody } from "./CultureHistoryModal.style";

interface CultureHistoryModalProps {
  admissionNumber: string;
}

/**
 * Every collection of the patient with the exam and material of the row the
 * user clicked on the recent cultures, released at any time and newest first.
 * The clicked culture stands out among them
 */
export function CultureHistoryModal({
  admissionNumber,
}: CultureHistoryModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { culture, status, data } = useAppSelector(
    (state) => state.infectionControl.cultureHistory,
  );

  const columns = useMemo(
    () => cultureColumns(t, { withExam: false, stackDates: false }),
    [t],
  );

  const retry = () => {
    if (culture) {
      dispatch(fetchCultureHistory({ admissionNumber, culture }));
    }
  };

  return (
    <DefaultModal
      open={!!culture}
      width={1120}
      centered
      destroyOnHidden
      footer={null}
      onCancel={() => dispatch(closeCultureHistory())}
    >
      <HistoryBody
        data-kb="infectionControl.cultureHistory"
        data-testid="culture-history"
      >
        <header className="history-header">
          <h2 className="history-title">{culture?.examName ?? "-"}</h2>
          {culture?.material && (
            <div className="history-material">{culture.material}</div>
          )}
          <p className="history-legend">
            {t("infectionControl.cultures.history.legend")}
          </p>
        </header>
        <CulturesBox>
          {status === "failed" ? (
            <CulturesError>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("infectionControl.cultures.history.loadError")}
              />
              <Button icon={<ReloadOutlined />} onClick={retry}>
                {t("infectionControl.retry")}
              </Button>
            </CulturesError>
          ) : (
            <Table
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={data?.cultures ?? []}
              loading={status === "loading"}
              pagination={false}
              scroll={{ x: 800 }}
              rowClassName={(row) =>
                row.id === culture?.id ? "culture-current" : ""
              }
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("infectionControl.cultures.history.empty")}
                  />
                ),
              }}
            />
          )}
        </CulturesBox>
      </HistoryBody>
    </DefaultModal>
  );
}
