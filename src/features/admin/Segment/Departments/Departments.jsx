import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";
import { Input } from "components/Inputs";
import Switch from "components/Switch";
import { getErrorMessage } from "utils/errorHandler";

import { fetchDepartments, setSegment, saveDepartments } from "../SegmentSlice";
import columns from "./columns";
import { FilterContainer } from "../Segment.style";

function DepartmentsForm({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const segment = useSelector((state) => state.admin.segment.single.data);
  const departments = useSelector(
    (state) => state.admin.segment.departments.list
  );
  const fetchStatus = useSelector(
    (state) => state.admin.segment.departments.status
  );
  const saveStatus = useSelector(
    (state) => state.admin.segment.saveDepartments.status
  );
  const [filter, setFilter] = useState({
    departmentName: null,
    onlySelected: false,
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchDepartments({ idSegment: segment.id }));
    } else {
      setFilter({
        departmentName: null,
        onlySelected: false,
      });
    }
  }, [open, segment, dispatch]);

  const initialValues = {
    selectedKeys: departments
      .filter((i) => i.checked)
      .map((i) => `${i.idHospital}-${i.idDepartment}`),
    selectedDepartments: departments.filter((i) => i.checked),
  };

  const filterList = (currentValues) => {
    if (!departments) return [];

    return departments.filter((i) => {
      let show = true;

      if (filter.departmentName) {
        show =
          show &&
          i.name.toLowerCase().includes(filter.departmentName.toLowerCase());
      }

      if (filter.onlySelected) {
        show =
          show &&
          currentValues.selectedKeys.indexOf(
            `${i.idHospital}-${i.idDepartment}`
          ) !== -1;
      }

      return show;
    });
  };

  const onSave = (params) => {
    const save = () => {
      const payload = {
        idSegment: segment.id,
        departmentList: params.selectedDepartments.map(
          ({ idDepartment, idHospital }) => ({
            idDepartment,
            idHospital,
          })
        ),
      };

      dispatch(saveDepartments(payload)).then((response) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          notification.success({
            message: "Setores atualizados com sucesso!",
          });
          setSegment(null);
          setOpen(false);
        }
      });
    };

    DefaultModal.confirm({
      title: "Confirma a atualização dos setores?",
      content: (
        <>
          <p>
            Segmento: {segment.description}
            <br />
            <strong>{params.selectedKeys.length}</strong> setores selecionados
          </p>
        </>
      ),
      onOk: save,
      okText: "Confirmar",
      cancelText: "Cancelar",
      width: 500,
    });
  };

  const onCancel = () => {
    dispatch(setSegment(null));
    setOpen(false);
  };

  const getDatasource = (currentValues) => {
    return filterList(currentValues).map((d) => ({
      key: `${d.idHospital}-${d.idDepartment}`,
      ...d,
    }));
  };

  const rowSelection = (selected, setFieldValue) => ({
    type: "checkbox",
    selectedRowKeys: selected,
    preserveSelectedRowKeys: true,
    onChange: (selectedRowKeys, selectedRows) => {
      setFieldValue("selectedKeys", selectedRowKeys);
      setFieldValue("selectedDepartments", selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.uses > 0,
      name: record.name,
    }),
  });

  const rowClassName = (record, bag) => {
    if (record.uses > 0) {
      return "suspended checked";
    }

    return "";
  };

  if (!open) {
    return null;
  }

  return (
    <Formik enableReinitialize onSubmit={onSave} initialValues={initialValues}>
      {({ handleSubmit, values, setFieldValue }) => (
        <DefaultModal
          open={open}
          width={"50vw"}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={handleSubmit}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={saveStatus === "loading"}
          okButtonProps={{
            disabled: saveStatus === "loading",
          }}
          cancelButtonProps={{
            disabled: saveStatus === "loading",
          }}
          maskClosable={false}
        >
          <header>
            <Heading style={{ fontSize: "20px" }}>
              Setores - {segment.description}
            </Heading>
          </header>

          <FilterContainer>
            <div className="info">
              {values.selectedKeys.length} setores selecionados
            </div>
            <div>
              <Input
                style={{ width: 300 }}
                placeholder="Procurar por setor"
                allowClear
                onChange={(ev) =>
                  setFilter({
                    ...filter,
                    ...{ departmentName: ev.target.value },
                  })
                }
              />
            </div>
            <div className="switch-container">
              <Switch
                id="onlySelected"
                checked={filter.onlySelected}
                onChange={(value) =>
                  setFilter({ ...filter, ...{ onlySelected: value } })
                }
              />
              <label htmlFor="onlySelected">Mostrar selecionados</label>
            </div>
          </FilterContainer>

          <ExpandableTable
            rowSelection={rowSelection(values.selectedKeys, setFieldValue)}
            columns={columns(t)}
            pagination={true}
            loading={fetchStatus === "loading"}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Nenhum departamento encontrado."
                />
              ),
            }}
            dataSource={fetchStatus !== "loading" ? getDatasource(values) : []}
            showSorterTooltip={false}
            rowClassName={rowClassName}
          />
        </DefaultModal>
      )}
    </Formik>
  );
}

export default DepartmentsForm;
