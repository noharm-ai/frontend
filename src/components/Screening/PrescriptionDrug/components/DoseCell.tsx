import React from "react";
import { SwapOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import Popover from "components/PopoverStyled";
import Button from "components/Button";
import { DoseCellPopover } from "./DoseCell.style";
import { formatNumber } from "src/utils/number";
import { setDrugUnitConversionOpen } from "features/drugs/DrugUnitConversion/DrugUnitConversionSlice";
import {
  TrackedPrescriptionAction,
  trackPrescriptionAction,
} from "src/utils/tracker";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";

interface DoseRecord {
  total?: boolean;
  infusion?: {
    disableTotal?: boolean;
    totalVol?: number;
  };
  idDrug: string;
  measureUnit?: any;
  dose?: string | number;
  dosage?: string | number;
  idMeasureUnitDefault?: string;
  doseconv?: string | number;
  useWeight?: boolean;
  doseRange?: string | number;
  doseWeight?: string;
  doseWeightValue?: string;
  doseWeightDay?: string;
  doseWeightDayValue?: string;
}

interface DoseCellBag {
  t: (key: string) => string;
  dispatch: (action: unknown) => void;
  handleRowExpand: (record: DoseRecord) => void;
}

interface DoseCellProps {
  record: DoseRecord;
  bag: DoseCellBag;
}

function DoseCell({ record, bag }: DoseCellProps): React.ReactElement | null {
  if (record.total && record.infusion) {
    return (
      <Tooltip
        title={bag.t("prescriptionDrugList.openSolutionCalculator")}
        placement="top"
      >
        <span
          onClick={() => bag.handleRowExpand(record)}
          style={{ cursor: "pointer" }}
        >
          {record.infusion.disableTotal ? (
            <>--</>
          ) : (
            <>{record.infusion.totalVol} mL</>
          )}
        </span>
      </Tooltip>
    );
  }

  const popoverContent = (
    <DoseCellPopover>
      <table className="info-table">
        <thead>
          <tr>
            <th className="info-label"></th>
            <th className="info-label right header">Dose</th>
            <th className="info-label header">Unidade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="info-value header">Dose prescrita</td>
            <td className="info-value right">{formatNumber(record.dose, 2)}</td>
            <td className="info-value">
              {record.measureUnit?.value || "(indefinida)"}
            </td>
          </tr>
          <tr>
            <td className="info-value header">Dose convertida</td>
            <td className="info-value right">
              {record.useWeight && !record.doseWeight ? (
                <span className="missing-data">Peso indefinido</span>
              ) : (
                <>
                  {record.doseRange && record.doseconv
                    ? `${formatNumber(Number(record.doseconv) - Number(record.doseRange), 2)} - ${formatNumber(record.doseconv, 2)}`
                    : formatNumber(record.doseconv, 2)}
                </>
              )}
            </td>
            <td className="info-value">
              {record.idMeasureUnitDefault || "(indefinida)"}
              {record.useWeight ? " / Kg" : ""}
            </td>
          </tr>

          {record.doseWeight && (
            <tr>
              <td className="info-value header">Dose/Kg</td>
              <td className="info-value right">{record.doseWeightValue}</td>
              <td className="info-value">
                {record.measureUnit?.value || "(indefinida)"} / Kg
              </td>
            </tr>
          )}

          {record.doseWeightDay && (
            <tr>
              <td className="info-value header">Dose/Kg/Dia</td>
              <td className="info-value right">{record.doseWeightDayValue}</td>
              <td className="info-value">
                {record.measureUnit?.value || "(indefinida)"} / Kg / Dia
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {PermissionService().has(Permission.WRITE_DRUG_ATTRIBUTES) && (
        <Button
          style={{ marginTop: "1rem" }}
          icon={<SwapOutlined />}
          size="small"
          onClick={() => {
            trackPrescriptionAction(
              TrackedPrescriptionAction.CLICK_DRUG_UNIT_CONVERSION,
            );
            bag.dispatch(
              setDrugUnitConversionOpen({
                idDrug: record.idDrug,
                open: true,
              }),
            );
          }}
        >
          Conversões de unidade
        </Button>
      )}
    </DoseCellPopover>
  );

  if (!record.measureUnit) {
    return (
      <Popover content={popoverContent} mouseEnterDelay={0.3}>
        <span>{record.dose}</span>
      </Popover>
    );
  }

  const measureUnitValue = record.measureUnit?.value || "(indefinida)";
  const measureUnit = PermissionService().has(Permission.READ_NAV)
    ? measureUnitValue.replace(/^\d+_/, "")
    : measureUnitValue;
  const formattedDose = `${record.dose ? record.dose.toLocaleString("pt-BR") : ""}`;

  return (
    <Popover content={popoverContent} mouseEnterDelay={0.3}>
      {formattedDose} {measureUnit}
    </Popover>
  );
}

export default DoseCell;
