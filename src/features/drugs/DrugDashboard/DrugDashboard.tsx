import { useEffect } from "react";
import { useParams } from "react-router-dom";

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
import { PageHeader } from "src/styles/PageHeader.style";

export function DrugDashboard() {
  const dispatch = useAppDispatch();
  const drugsSearch = useAppSelector((state: any) => state.drugs.search);
  const segments = useAppSelector((state: any) => state.segments);
  const drugDashboard = useAppSelector((state: any) => state.drugDashboard);
  const params = useParams();

  const idSegmentParam = params.idSegment
    ? parseInt(params.idSegment, 10)
    : null;
  const idDrugParam = params.idDrug ? parseInt(params.idDrug, 10) : null;

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
        }),
      );
    }
  }, [dispatch, drugDashboard.idSegment, drugDashboard.idDrug]);

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Painel de Medicamentos</h1>
        </div>
        <div className="page-header-actions"></div>
      </PageHeader>
      <DrugDashboardFilter
        segments={{ list: segments.list, isFetching: segments.isFetching }}
        drugs={{ list: drugsSearch.list, isFetching: drugsSearch.isFetching }}
      />
      {drugDashboard.idSegment && drugDashboard.idDrug && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <DrugOutliersCard
              outliers={drugDashboard.data?.outliers ?? []}
              loading={drugDashboard.status === "loading"}
            />
          </Col>
        </Row>
      )}
    </>
  );
}
