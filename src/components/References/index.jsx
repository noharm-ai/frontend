import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash.isempty";
import { Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SettingOutlined } from "@ant-design/icons";

import breakpoints from "styles/breakpoints";
import { useMedia } from "lib/hooks";
import { toDataSource } from "utils";
import Table from "components/Table";
import Empty from "components/Empty";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import Tabs from "components/Tabs";
import Button from "components/Button";
import BackTop from "components/BackTop";
import Card from "components/Card";
import LoadBox from "components/LoadBox";
import Edit from "containers/References/Edit";
import EditSubstance from "containers/References/EditSubstance";
import ScoreWizard from "containers/References/ScoreWizard";
import Filter from "./Filter";
import columns from "./columns";
import relationsColumns from "./Relation/columns";
import { PageCard } from "styles/Utils.style";
import DrugAttributesForm from "features/drugs/DrugAttributesForm/DrugAttributesForm";
import { fetchDrugAttributes } from "features/drugs/DrugAttributesForm/DrugAttributesFormSlice";

// empty text for table result.
const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

const noop = () => {};
const theTitle = () => "Deslize para a direita para ver mais conteúdo.";

export default function References({
  outliers,
  fetchReferencesList,
  saveOutlier,
  saveOutlierRelation,
  saveUnitCoefficient,
  selectOutlier,
  selectOutlierRelation,
  security,
  generateOutlier,
  generateOutlierReset,
  updateDrugData,
  ...restProps
}) {
  const params = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const drugAttributes = useSelector((state) => state.drugAttributesForm.data);
  const { isFetching, list, error, generateStatus, drugData, relationStatus } =
    outliers;
  const [obsModalVisible, setObsModalVisibility] = useState(false);

  const [title] = useMedia(
    [`(max-width: ${breakpoints.lg})`],
    [[theTitle]],
    [noop]
  );

  const onSaveObs = () => {
    saveOutlier(outliers.edit.item.idOutlier, { obs: outliers.edit.item.obs })
      .then(() => {
        notification.success({ message: "Observação salva com sucesso!" });
        setObsModalVisibility(false);
      })
      .catch((err) => {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };
  const onCancelObs = () => {
    selectOutlier({});
    setObsModalVisibility(false);
  };
  const onShowObsModal = (data) => {
    selectOutlier(data);
    setObsModalVisibility(true);
  };

  const dataSource = toDataSource(list, "idOutlier", {
    saveOutlier,
    onShowObsModal,
  });
  const dsRelations = toDataSource(drugData.relations, null, {
    relationTypes: drugData.relationTypes,
    sctidA: drugData.sctidA,
    sctNameA: drugData.sctNameA,
  });

  useEffect(() => {
    if (!isEmpty(params)) {
      fetchReferencesList(
        params.idSegment,
        params.idDrug,
        params.dose,
        params.frequency
      );
    } else {
      fetchReferencesList();
    }
  }, [fetchReferencesList, params]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [error, t]);

  useEffect(() => {
    if (!isEmpty(generateStatus.error)) {
      notification.error({
        message: "Ops! Algo de errado aconteceu ao gerar os outliers.",
      });
    }
  }, [generateStatus.error]);

  useEffect(() => {
    if (generateStatus.generated) {
      notification.success({ message: "Escores gerados com sucesso!" });
      generateOutlierReset();

      if (!isEmpty(params)) {
        fetchReferencesList(
          params.idSegment,
          params.idDrug,
          params.dose,
          params.frequency
        );
      } else {
        fetchReferencesList();
      }

      restProps.fetchDrugsUnitsList({
        id: outliers.selecteds.idDrug,
        idSegment: outliers.selecteds.idSegment,
      });
    }
  }, [
    generateStatus.generated,
    generateOutlierReset,
    params,
    fetchReferencesList,
    restProps,
    outliers.selecteds.idDrug,
    outliers.selecteds.idSegment,
  ]);

  const rowClassName = (record, index) => {
    if (record.selected) {
      return "highlight";
    }
  };

  const afterSaveSubstance = () => {
    dispatch(
      fetchDrugAttributes({
        idDrug: outliers.selecteds.idDrug,
        idSegment: outliers.selecteds.idSegment,
      })
    );
  };

  const items = [
    {
      key: "1",
      label: "Escores",
      children: (
        <>
          <Table
            title={title}
            columns={columns}
            pagination={false}
            loading={isFetching}
            locale={{ emptyText }}
            dataSource={!isFetching ? dataSource : []}
            rowClassName={rowClassName}
          />

          <PageCard style={{ marginTop: "4rem" }}>
            <ScoreWizard />
          </PageCard>
        </>
      ),
    },
    {
      key: "2",
      label: "Atributos",
      children: (
        <Row gutter={24}>
          <Col xs={24} md={10}>
            <Card title="Atributos do Medicamento" type="inner">
              {!isFetching ? (
                <DrugAttributesForm
                  idSegment={outliers.selecteds.idSegment}
                  idDrug={outliers.selecteds.idDrug}
                />
              ) : (
                <LoadBox />
              )}
            </Card>
          </Col>
          <Col xs={24} md={14}>
            {security.isSupport() && drugAttributes.drugRef && (
              <Card title="Curadoria de Doses" type="inner">
                <div
                  dangerouslySetInnerHTML={{ __html: drugAttributes.drugRef }}
                />
              </Card>
            )}
          </Col>
        </Row>
      ),
    },
    {
      key: "3",
      label: "Relações",
      children: (
        <>
          <Row type="flex" justify="end">
            <Col xs={24 - 6}>
              <EditSubstance afterSaveSubstance={afterSaveSubstance} />
            </Col>
            <Col xs={6}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {(security.isAdmin() || security.isTraining()) &&
                  drugData.sctidA && (
                    <Button
                      onClick={() => window.open("/admin/relacoes")}
                      icon={<SettingOutlined />}
                    >
                      Curadoria de relações
                    </Button>
                  )}
              </div>
            </Col>
          </Row>
          <Table
            title={title}
            columns={relationsColumns(security)}
            pagination={false}
            loading={isFetching || relationStatus.isFetching}
            locale={{ emptyText }}
            dataSource={!isFetching ? dsRelations : []}
            showSorterTooltip={false}
          />
        </>
      ),
    },
  ];

  return (
    <>
      <Filter {...restProps} outliers={outliers} />
      <Tabs
        defaultActiveKey="1"
        style={{ width: "100%", marginTop: "20px" }}
        type="card gtm-tab-med"
        items={items}
      ></Tabs>

      <BackTop />

      <DefaultModal
        centered
        destroyOnClose
        onOk={onSaveObs}
        open={obsModalVisible}
        onCancel={onCancelObs}
        confirmLoading={outliers.saveStatus.isSaving}
        okText="Salvar"
        okButtonProps={{
          disabled: outliers.saveStatus.isSaving,
          type: "primary gtm-bt-save-obs",
        }}
        cancelText="Cancelar"
        cancelButtonProps={{
          disabled: outliers.saveStatus.isSaving,
          type: "nda gtm-bt-cancel-obs",
        }}
      >
        <Edit />
      </DefaultModal>
    </>
  );
}
