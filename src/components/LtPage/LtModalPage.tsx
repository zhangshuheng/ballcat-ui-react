import React, { useState, useEffect, useRef } from 'react';
import LtTable from '@/components/LtTable';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import type { ModalFormRef } from '@/components/LtForm';
import LtModalForm from '@/components/LtForm/LtModalForm';
import type { LtModalPageProps } from './typings';
import I18n from '@/utils/I18nUtils';
import utils from './utils';

const LtModalPage = <T, U, E, P = E, ValueType = 'text'>({
  title,
  rowKey,
  query,
  columns,
  toolBarActions,
  onStatusChange,
  create,
  edit,
  onFinish = () => {},
  children,
  operateBar,
  operteBarProps,
  formData = (data) => {
    return data as unknown as E;
  },
  del,
  handlerData,
  tableProps,
  modalProps,
  tableRef: tr,
  modalRef: mr,
  perStatusChange = () => undefined,
}: LtModalPageProps<T, U, E, P, ValueType>) => {
  let tableRef = useRef<ActionType>();
  let modalRef = useRef<ModalFormRef<E>>();

  if (mr) {
    modalRef = mr;
  }

  if (tr) {
    tableRef = tr;
  }

  const [toolBarActionsList, setToolBarActionsList] = useState<React.ReactNode[]>([]);
  const [tableColumns, setTableColumns] = useState<ProColumns<T, ValueType>[]>([]);

  // 表格上方工具栏更新
  useEffect(() => {
    setToolBarActionsList(
      utils.generateToolBarActionsList(perStatusChange, modalRef, toolBarActions),
    );
  }, [toolBarActions]);

  // 表格列更新
  useEffect(() => {
    const newColumns = columns ? [...columns] : [];

    if (operateBar && operateBar.length > 0) {
      newColumns.push(
        utils.generateOperateBar(
          operateBar,
          rowKey,
          perStatusChange,
          formData,
          modalRef,
          tableRef,
          del,
          operteBarProps,
        ),
      );
    }

    setTableColumns(newColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, operateBar]);

  return (
    <>
      <LtTable<T, U, ValueType>
        {...tableProps}
        rowKey={rowKey}
        columns={tableColumns}
        request={query}
        headerTitle={title}
        actionRef={tableRef}
        toolbar={{ ...tableProps?.toolbar, actions: toolBarActionsList }}
      />

      <LtModalForm<E, P>
        {...modalProps}
        mfRef={modalRef}
        onStatusChange={onStatusChange}
        handlerData={handlerData}
        create={create}
        edit={edit}
        onFinish={(st, body) => {
          tableRef.current?.reload();
          onFinish(st, body);
          I18n.success('global.operation.success');
        }}
      >
        {children}
      </LtModalForm>
    </>
  );
};

export default LtModalPage;
