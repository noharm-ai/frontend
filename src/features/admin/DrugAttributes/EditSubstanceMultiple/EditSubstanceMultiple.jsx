import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { List, Progress } from "antd";

import DefaultModal from "components/Modal";
import { Select } from "components/Inputs";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";
import { updateSubstance } from "../DrugAttributesSlice";

export function EditSubstanceMultiple({ open, setOpen }) {
  const dispatch = useDispatch();
  const [sctid, setSctid] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const cancelledRef = useRef(false);

  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesLoading =
    useSelector((state) => state.lists.getSubstances.status) === "loading";

  const drugList = useSelector((state) => state.admin.drugAttributes.list);
  const selectedKeys = useSelector(
    (state) => state.admin.drugAttributes.selectedRows.list,
  );

  const selectedDrugs = Object.values(
    drugList
      .filter((d) => selectedKeys.includes(`${d.idSegment}-${d.idDrug}`))
      .reduce((acc, d) => {
        if (!acc[d.idDrug]) {
          acc[d.idDrug] = { idDrug: d.idDrug, name: d.name, segments: [] };
        }
        if (d.segment) {
          acc[d.idDrug].segments.push(d.segment);
        }
        return acc;
      }, {}),
  );

  const reset = () => {
    setSctid(null);
    setProcessing(false);
    setProgress({ current: 0, total: 0 });
    cancelledRef.current = false;
  };

  const onCancel = () => {
    reset();
    setOpen(false);
  };

  const onOk = async () => {
    cancelledRef.current = false;
    setProcessing(true);
    setProgress({ current: 0, total: selectedDrugs.length });

    let completed = 0;

    for (const drug of selectedDrugs) {
      if (cancelledRef.current) break;

      const response = await dispatch(
        updateSubstance({ idDrug: drug.idDrug, sctid }),
      );

      if (response.error) {
        notification.error({ message: getErrorMessage(response, null) });
      }

      completed += 1;
      setProgress({ current: completed, total: selectedDrugs.length });
    }

    setProcessing(false);

    if (cancelledRef.current) {
      notification.warning({ message: "Operação cancelada" });
    } else {
      notification.success({ message: "Substâncias atualizadas!" });
      onCancel();
    }
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    setProcessing(false);
  };

  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <DefaultModal
      open={open}
      title="Definir substância"
      onCancel={processing ? undefined : onCancel}
      onOk={onOk}
      okText="Confirmar"
      cancelText="Cancelar"
      okButtonProps={{ disabled: !sctid || processing, style: processing ? { display: "none" } : {} }}
      cancelButtonProps={{ disabled: processing, style: processing ? { display: "none" } : {} }}
      width={600}
      closable={!processing}
      maskClosable={!processing}
    >
      {processing ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            padding: "24px 0",
          }}
        >
          <Progress
            type="circle"
            percent={percent}
            format={() => `${progress.current}/${progress.total}`}
          />
          <Button danger onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Form>
          <div className="form-row">
            <div className="form-label">
              <label>A substância será aplicada nestes medicamentos:</label>
            </div>
            <List
              size="small"
              style={{
                maxHeight: 250,
                overflowY: "auto",
                background: "#fafafa",
              }}
              dataSource={selectedDrugs}
              renderItem={(drug) => (
                <List.Item>
                  <span>
                    <strong>{drug.name}</strong>
                  </span>
                </List.Item>
              )}
            />
          </div>

          <div className="form-row">
            <div className="form-label">
              <label>Substância</label>
            </div>
            <div className="form-input">
              <Select
                style={{ width: "100%" }}
                value={sctid}
                onChange={setSctid}
                showSearch={{ optionFilterProp: ["label"] }}
                disabled={substancesLoading}
                loading={substancesLoading}
                allowClear
                placeholder="Selecione a substância..."
                optionRender={(option) => (
                  <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
                    {option.label}
                  </div>
                )}
                options={substances.map(({ sctid, name, active }) => ({
                  value: sctid,
                  label: `${active ? "" : "(INATIVO) "}${name}`,
                }))}
              />
            </div>
          </div>
        </Form>
      )}
    </DefaultModal>
  );
}
