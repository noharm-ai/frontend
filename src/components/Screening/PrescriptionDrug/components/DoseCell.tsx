import React from "react";
import { SwapOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import Popover from "components/PopoverStyled";
import Button from "components/Button";
import { DoseCellPopover, DoseValue } from "./DoseCell.style";
import { formatNumber } from "src/utils/number";
import { getDifferentiatedDose } from "src/utils/dose";
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
  differentiatedDose?: string | null;
  dosage?: string | number;
  idMeasureUnitDefault?: string;
  // prescalc's outlier score key: the range of a range drug
  doseconv?: string | number;
  // the dose in the default unit (dose x factor), as the alerts read it
  convertedDose?: number | null;
  useWeight?: boolean;
  doseRange?: string | number;
  doseWeight?: string;
  doseWeightValue?: string;
  doseWeightDay?: string;
  doseWeightDayValue?: string;
  // prescribed in a unit other than the default one, with no factor to it
  missingConvertFactor?: boolean;
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

  const differentiatedDose = getDifferentiatedDose(record);

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
            <td className="info-value right">
              {differentiatedDose ?? formatNumber(record.dose, 2)}
            </td>
            <td className="info-value">
              {record.measureUnit?.value || "(indefinida)"}
            </td>
          </tr>
          <tr>
            <td className="info-value header">Dose convertida</td>
            <td className="info-value right">
              {record.missingConvertFactor ? (
                <span className="missing-data">Sem fator de conversão</span>
              ) : (
                formatNumber(record.convertedDose, 2)
              )}
            </td>
            <td className="info-value">
              {record.idMeasureUnitDefault || "(indefinida)"}
            </td>
          </tr>

          {record.doseRange && (
            <tr>
              <td className="info-value header">Faixa (escore)</td>
              <td className="info-value right">
                {record.useWeight && !record.doseWeight ? (
                  <span className="missing-data">Peso indefinido</span>
                ) : record.doseconv ? (
                  `${formatNumber(Number(record.doseconv) - Number(record.doseRange), 2)} - ${formatNumber(record.doseconv, 2)}`
                ) : (
                  "-"
                )}
              </td>
              <td className="info-value">
                {record.idMeasureUnitDefault || "(indefinida)"}
                {record.useWeight ? " / Kg" : ""}
              </td>
            </tr>
          )}

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

      {differentiatedDose && (
        <p className="differentiated-dose-note">
          <strong>Dose diferenciada:</strong> o prescritor definiu uma dose
          diferente para cada administração ({differentiatedDose}). A dose
          convertida corresponde à soma de todas as doses.
        </p>
      )}

      {record.missingConvertFactor && (
        <p className="missing-convert-factor-note">
          <strong>Sem fator de conversão:</strong> não há fator de{" "}
          {record.measureUnit?.value} para a unidade padrão (
          {record.idMeasureUnitDefault}). A dose não é convertida e a dose
          máxima a considera como se já estivesse na unidade padrão.
        </p>
      )}

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
        <span>{differentiatedDose ?? record.dose}</span>
      </Popover>
    );
  }

  const measureUnitValue = record.measureUnit?.value || "(indefinida)";
  const measureUnit = PermissionService().has(Permission.READ_NAV)
    ? measureUnitValue.replace(/^\d+_/, "")
    : measureUnitValue;
  const formattedDose =
    differentiatedDose ??
    `${record.dose ? record.dose.toLocaleString("pt-BR") : ""}`;

  return (
    <Popover content={popoverContent} mouseEnterDelay={0.3}>
      <DoseValue
        className={record.missingConvertFactor ? "missing-convert-factor" : ""}
      >
        {formattedDose} {measureUnit}
      </DoseValue>
    </Popover>
  );
}

export default DoseCell;
