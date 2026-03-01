import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { Row, Col, Space } from "antd";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import breakpoints from "styles/breakpoints";
import { useMedia } from "lib/hooks";
import { toDataSource } from "utils";
import Table from "components/Table";
import Empty from "components/Empty";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import Tabs from "components/Tabs";
import BackTop from "components/BackTop";
import Card from "components/Card";
import LoadBox from "components/LoadBox";
import Edit from "containers/References/Edit";
import EditSubstance from "containers/References/EditSubstance";
import ScoreWizard from "containers/References/ScoreWizard";
import Filter from "./Filter";
import columns from "./columns";
import { PageCard } from "styles/Utils.style";
import DrugAttributesForm from "features/drugs/DrugAttributesForm/DrugAttributesForm";
import { fetchDrugAttributes } from "features/drugs/DrugAttributesForm/DrugAttributesFormSlice";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

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
  selectOutlier,
  generateOutlierReset,
  ...restProps
}) {
  const params = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const drugAttributes = useSelector((state) => state.drugAttributesForm.data);
  const { isFetching, list, error, generateStatus } = outliers;
  const [obsModalVisible, setObsModalVisibility] = useState(false);

  const [title] = useMedia(
    [`(max-width: ${breakpoints.lg})`],
    [[theTitle]],
    [noop],
  );

  const onSaveObs = () => {
    saveOutlier(outliers.edit.item.idOutlier, { obs: outliers.edit.item.obs })
      .then(() => {
        notification.success({ message: "Observação salva com sucesso!" });
        setObsModalVisibility(false);
      })
      .catch(() => {
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

  useEffect(() => {
    if (!isEmpty(params)) {
      fetchReferencesList(
        params.idSegment,
        params.idDrug,
        params.dose,
        params.frequency,
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
          params.frequency,
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

  const rowClassName = (record) => {
    if (record.selected) {
      return "highlight";
    }
  };

  const afterSaveSubstance = () => {
    dispatch(
      fetchDrugAttributes({
        idDrug: outliers.selecteds.idDrug,
        idSegment: outliers.selecteds.idSegment,
      }),
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
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Card title="Substância" type="inner">
                <EditSubstance afterSaveSubstance={afterSaveSubstance} />
              </Card>

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
            </Space>
          </Col>
          <Col xs={24} md={14}>
            {PermissionService().has(Permission.ADMIN_SUBSTANCES) &&
              drugAttributes.drugRef && (
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
  ];

  return (
    <>
      <Filter {...restProps} outliers={outliers} />
      <Tabs
        defaultActiveKey="1"
        style={{ width: "100%", marginTop: "20px" }}
        type="line"
        items={items}
      ></Tabs>

      <BackTop />

      <DefaultModal
        centered
        destroyOnHidden
        onOk={onSaveObs}
        open={obsModalVisible}
        onCancel={onCancelObs}
        confirmLoading={outliers.saveStatus.isSaving}
        okText="Salvar"
        okButtonProps={{
          disabled: outliers.saveStatus.isSaving,
        }}
        cancelText="Cancelar"
        cancelButtonProps={{
          disabled: outliers.saveStatus.isSaving,
        }}
      >
        <Edit />
      </DefaultModal>
    </>
  );
}
