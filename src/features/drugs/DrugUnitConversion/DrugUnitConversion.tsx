import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip, Spin } from "antd";

import DefaultModal from "components/Modal";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch, useAppSelector } from "store/index";
import {
  fetchDrugUnitConversion,
  saveUnitConversion,
  setDrugUnitConversionOpen,
  IConversionItem,
} from "./DrugUnitConversionSlice";
import { formatNumber } from "src/utils/number";
import {
  LargeInputNumber,
  DefaultUnitCard,
  DefaultUnitInfo,
  DefaultUnitBadge,
  ConversionsGrid,
  ConversionCard,
  ConversionBadgesRow,
  SourceUnitBadge,
  ArrowSeparator,
  TargetUnitBadge,
  ValuesRow,
  ConversionDescription,
  FooterRow,
  LoadingContainer,
  EmptyMessage,
} from "./DrugUnitConversion.style";

export function DrugUnitConversion() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.drugUnitConversion.open);
  const idDrug = useAppSelector((state) => state.drugUnitConversion.idDrug);
  const status = useAppSelector((state) => state.drugUnitConversion.status);
  const savingStatus = useAppSelector(
    (state) => state.drugUnitConversion.savingStatus,
  );
  const data = useAppSelector((state) => state.drugUnitConversion.data);

  // Tracks only user-edited values; data.factor is the original
  const [factorOverrides, setFactorOverrides] = useState<
    Record<string, number | null>
  >({});
  const [invalidItems, setInvalidItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && idDrug != null) {
      dispatch(fetchDrugUnitConversion(idDrug));
    }
  }, [open, idDrug, dispatch]);

  const isFactorValid = (factor: number | null | undefined) =>
    factor != null && factor > 0 && factor < 99999;

  const onClose = () => {
    setFactorOverrides({});
    setInvalidItems(new Set());
    dispatch(setDrugUnitConversionOpen({ open: false }));
  };

  const onSave = () => {
    if (!idDrug || !data) return;

    const conversion_list = data.conversionList.map((item) => ({
      id_measure_unit: item.idMeasureUnit,
      factor:
        item.idMeasureUnit in factorOverrides
          ? factorOverrides[item.idMeasureUnit]
          : item.factor,
    }));

    const invalid = new Set(
      conversion_list
        .filter((item) => !isFactorValid(item.factor))
        .map((item) => item.id_measure_unit),
    );

    if (invalid.size > 0) {
      setInvalidItems(invalid);
      notification.error({
        message: t(
          "drugUnitConversion.validationError",
          "Todos os fatores devem ser preenchidos com um valor entre 0 e 99999.",
        ),
      });
      return;
    }

    setInvalidItems(new Set());
    dispatch(saveUnitConversion({ idDrug, conversion_list })).then(
      (response: any) => {
        if (response.error) {
          notification.error({ message: getErrorMessage(response, t) });
        } else {
          notification.success({
            message: t(
              "drugUnitConversion.saveSuccess",
              "Conversões salvas com sucesso!",
            ),
          });
          onClose();
        }
      },
    );
  };

  const isSaving = savingStatus === "loading";
  const isLoading = status === "loading";

  const defaultUnit = data?.substanceMeasureUnit;
  const otherUnits = data?.conversionList.filter((item) => !item.default) ?? [];
  const defaultUnitItem = data?.conversionList.find((item) => item.default);

  const getEffectiveFactor = (item: IConversionItem) =>
    item.idMeasureUnit in factorOverrides
      ? factorOverrides[item.idMeasureUnit]
      : item.factor;

  const renderDefaultUnit = () => {
    const label = defaultUnitItem?.measureUnit ?? defaultUnit;
    return (
      <DefaultUnitCard>
        <DefaultUnitInfo>
          <div style={{ fontSize: 13 }}>
            <div
              style={{ fontWeight: 600, lineHeight: 1.2, paddingRight: "15px" }}
            >
              {data?.name}
            </div>
            {t(
              "drugUnitConversion.defaultUnit",
              "Unidade padrão do medicamento",
            )}
            : {label ?? "-"}
          </div>
          <Tooltip
            title={t(
              "drugUnitConversion.defaultUnit",
              "Unidade padrão do medicamento",
            )}
          >
            <DefaultUnitBadge>{defaultUnit ?? "-"}</DefaultUnitBadge>
          </Tooltip>
        </DefaultUnitInfo>
      </DefaultUnitCard>
    );
  };

  const renderConversionRow = (item: IConversionItem) => {
    const label = item.idMeasureUnit;
    const effectiveFactor = getEffectiveFactor(item);
    const factorDisplay =
      effectiveFactor != null ? formatNumber(effectiveFactor) : "?";

    const isInvalid = invalidItems.has(item.idMeasureUnit);

    return (
      <ConversionCard key={item.id} $invalid={isInvalid}>
        <ConversionDescription>
          1 {label} {t("drugUnitConversion.equivalentTo", "equivale a")}{" "}
          {factorDisplay} {defaultUnit ?? "-"}
        </ConversionDescription>

        <ValuesRow>
          <LargeInputNumber
            value={effectiveFactor ?? undefined}
            $invalid={isInvalid}
            onChange={(val: number | null) => {
              setFactorOverrides((prev) => ({
                ...prev,
                [item.idMeasureUnit]: val as number | null,
              }));
              if (isInvalid) {
                setInvalidItems((prev) => {
                  const next = new Set(prev);
                  next.delete(item.idMeasureUnit);
                  return next;
                });
              }
            }}
            min={0}
            max={99999999}
          />
        </ValuesRow>

        <ConversionBadgesRow>
          <SourceUnitBadge>
            <Tooltip
              title={
                item.measureUnit || "Registro da unidade não foi encontrado"
              }
            >
              {item.idMeasureUnit}
            </Tooltip>
          </SourceUnitBadge>
          <ArrowSeparator>→</ArrowSeparator>
          <TargetUnitBadge>{defaultUnit ?? "-"}</TargetUnitBadge>
        </ConversionBadgesRow>
      </ConversionCard>
    );
  };

  return (
    <DefaultModal
      open={open}
      onCancel={onClose}
      footer={
        <FooterRow>
          <Button onClick={onClose} disabled={isSaving}>
            {t("actions.cancel", "Cancelar")}
          </Button>
          <Button
            type="primary"
            onClick={onSave}
            loading={isSaving}
            disabled={isLoading || otherUnits.length === 0}
          >
            {t("actions.save", "Salvar")}
          </Button>
        </FooterRow>
      }
      width={640}
      centered
      destroyOnHidden
      title={
        <div>
          <div className="modal-title">
            {t("drugUnitConversion.title", "Conversões de unidade")}
          </div>
        </div>
      }
    >
      {isLoading ? (
        <Spin spinning={true}>
          <LoadingContainer>
            {t("common.loading", "Carregando...")}
          </LoadingContainer>
        </Spin>
      ) : (
        <div>
          {defaultUnit != null && renderDefaultUnit()}
          {otherUnits.length > 0 ? (
            <ConversionsGrid>
              {otherUnits.map(renderConversionRow)}
            </ConversionsGrid>
          ) : (
            !isLoading && (
              <EmptyMessage>
                {t(
                  "drugUnitConversion.noConversions",
                  "Nenhuma conversão disponível.",
                )}
              </EmptyMessage>
            )
          )}
        </div>
      )}
    </DefaultModal>
  );
}
