import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Alert, Space } from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { searchDrugsThunk } from "store/ducks/drugs/thunk";
import {
  setIdSegment,
  setIdDrug,
  fetchDrugDashboard,
} from "./DrugDashboardSlice";
import { Row, Col } from "components/Grid";
import { DrugDashboardFilter } from "./DrugDashboardFilter";
import { DrugOutliersCard } from "./components/DrugOutliersCard";
import { DrugConversionsCard } from "./components/DrugConversionsCard";
import { DrugAttributesCard } from "./components/DrugAttributesCard";
import { DrugUnitConversion } from "src/features/drugs/DrugUnitConversion";
import { DrugRemoveOutlier } from "src/features/drugs/DrugRemoveOutlier/DrugRemoveOutlier";
import { DrugGeneratePrescriptionHistory } from "src/features/drugs/DrugGeneratePrescriptionHistory";
import { DrugGenerateScore } from "src/features/drugs/DrugGenerateScore";
import { setDrugRemoveOutlierOpen } from "src/features/drugs/DrugRemoveOutlier/DrugRemoveOutlierSlice";
import { setDrugGeneratePrescriptionHistoryOpen } from "src/features/drugs/DrugGeneratePrescriptionHistory";
import DrugSubstance from "features/drugs/DrugSubstance/DrugSubstance";
import Button from "components/Button";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { PageHeader } from "src/styles/PageHeader.style";
import DrugReferenceDrawer from "features/admin/DrugReferenceDrawer/DrugReferenceDrawer";
import SubstanceForm from "features/admin/Substance/Form/SubstanceForm";

export function DrugDashboard() {
  const dispatch = useAppDispatch();
  const drugsSearch = useAppSelector((state: any) => state.drugs.search);
  const segments = useAppSelector((state: any) => state.segments);
  const drugDashboard = useAppSelector((state: any) => state.drugDashboard);
  const drugGenerateScoreOpenCount = useAppSelector(
    (state: any) => state.drugGenerateScore.openCount,
  );
  const params = useParams();

  const idSegmentParam = params.idSegment
    ? parseInt(params.idSegment, 10)
    : null;
  const idDrugParam = params.idDrug ?? null;

  const outlierDose = params.dose;
  const outlierFrequency = params.frequency;

  useEffect(() => {
    dispatch(setIdSegment(idSegmentParam));
    if (idSegmentParam) {
      dispatch(searchDrugsThunk(idSegmentParam));
    }
  }, [dispatch, idSegmentParam]);

  useEffect(() => {
    dispatch(setIdDrug(idDrugParam));
  }, [dispatch, idDrugParam]);

  useEffect(() => {
    if (drugDashboard.idSegment && drugDashboard.idDrug) {
      dispatch(
        fetchDrugDashboard({
          idSegment: drugDashboard.idSegment,
          idDrug: drugDashboard.idDrug,
          dose: outlierDose,
          frequency: outlierFrequency,
        }),
      );
    }
  }, [
    dispatch,
    drugDashboard.idSegment,
    drugDashboard.idDrug,
    outlierDose,
    outlierFrequency,
  ]);

  const handleAfterSave = () => {
    if (drugDashboard.idSegment && drugDashboard.idDrug) {
      dispatch(
        fetchDrugDashboard({
          idSegment: drugDashboard.idSegment,
          idDrug: drugDashboard.idDrug,
          dose: outlierDose,
          frequency: outlierFrequency,
        }),
      );
    }
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Painel de Medicamentos</h1>
        </div>
        <div className="page-header-actions">
          {drugDashboard.idSegment &&
            drugDashboard.idDrug &&
            PermissionService().has(Permission.MAINTAINER) && (
              <>
                <Button
                  danger
                  onClick={() =>
                    dispatch(
                      setDrugGeneratePrescriptionHistoryOpen({
                        open: true,
                        idDrug: drugDashboard.idDrug,
                        idSegment: drugDashboard.idSegment,
                      }),
                    )
                  }
                >
                  Gerar Histórico de Prescrição
                </Button>
                <Button
                  danger
                  onClick={() =>
                    dispatch(
                      setDrugRemoveOutlierOpen({
                        open: true,
                        idSegment: drugDashboard.idSegment,
                        idDrug: drugDashboard.idDrug,
                      }),
                    )
                  }
                >
                  Remover Outlier
                </Button>
              </>
            )}
        </div>
      </PageHeader>
      <DrugDashboardFilter
        segments={{ list: segments.list, isFetching: segments.isFetching }}
        drugs={{ list: drugsSearch.list, isFetching: drugsSearch.isFetching }}
      />
      {!drugDashboard.idDrug && (
        <div
          style={{ textAlign: "center", padding: "80px 0", color: "#8c8c8c" }}
        >
          <MedicineBoxOutlined
            style={{
              fontSize: 72,
              color: "#d9d9d9",
              display: "block",
              marginBottom: 24,
            }}
          />
          <h2 style={{ color: "#595959", marginBottom: 8 }}>
            Selecione um medicamento
          </h2>
          <p style={{ fontSize: 14 }}>
            Escolha um segmento e um medicamento no filtro acima para visualizar
            o painel.
          </p>
        </div>
      )}
      {drugDashboard.idSegment &&
        drugDashboard.idDrug &&
        (drugDashboard.data && !drugDashboard.data.substance?.sctid ? (
          <div style={{ marginTop: 16, maxWidth: "500px", margin: "0 auto" }}>
            <Alert
              type="error"
              description="Substância não definida. Adicione uma substância para continuar."
              showIcon
              style={{ marginBottom: 16 }}
            />
            <DrugSubstance
              idDrug={drugDashboard.idDrug}
              sctidA={null}
              sctNameA={null}
              onAfterSave={handleAfterSave}
            />
          </div>
        ) : (
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <DrugAttributesCard
                idSegment={drugDashboard.idSegment}
                idDrug={drugDashboard.idDrug}
                sctid={drugDashboard.data?.substance?.sctid ?? null}
                sctName={drugDashboard.data?.substance?.name ?? null}
                onAfterSave={handleAfterSave}
              />
            </Col>
            <Col xs={24} lg={12}>
              <Space
                orientation="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                <DrugOutliersCard
                  outliers={drugDashboard.data?.outliers ?? []}
                  loading={drugDashboard.status === "loading"}
                />

                <DrugConversionsCard
                  conversions={drugDashboard.data?.conversions ?? []}
                  defaultUnit={
                    drugDashboard.data?.attributes?.idMeasureUnit ?? null
                  }
                  idDrug={drugDashboard.idDrug}
                  loading={drugDashboard.status === "loading"}
                />
              </Space>
            </Col>
            <Col xs={24} lg={12}></Col>
          </Row>
        ))}
      <DrugUnitConversion onAfterSave={handleAfterSave} />
      <DrugRemoveOutlier onAfterSave={handleAfterSave} />
      <DrugGeneratePrescriptionHistory onAfterSave={handleAfterSave} />
      <DrugGenerateScore
        key={drugGenerateScoreOpenCount}
        onAfterSave={handleAfterSave}
      />
      <DrugReferenceDrawer placement="bottom" />
      <SubstanceForm />
    </>
  );
}
