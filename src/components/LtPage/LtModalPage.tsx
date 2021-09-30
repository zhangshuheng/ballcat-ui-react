import React, { useState, useEffect, useRef } from 'react';
import LtTable from '@/components/LtTable';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import type { ModalFormRef } from '@/components/LtForm';
import Auth from '@/components/Auth';
import LtModalForm from '@/components/LtForm/LtModalForm';
import type { LtModalPageProps } from './typings';
import I18n from '@/utils/I18nUtils';
import { defautlTitle } from '@/components/LtForm/LtModalForm';

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
    setToolBarActionsList([]);
    if (toolBarActions && toolBarActions.length > 0) {
      const tbList: React.ReactNode[] = [];
      toolBarActions.forEach((tb) => {
        if (!React.isValidElement(tb)) {
          tbList.push(
            <Auth.Button
              domKey="lt-page-tool-bar-action-create"
              type="primary"
              icon="plus"
              // @ts-ignore
              permission={tb.permission}
              text={defautlTitle.create}
              onClick={() => {
                if (perStatusChange('create') === false) {
                  return;
                }
                modalRef.current?.create();
              }}
            />,
          );
        } else {
          tbList.push(tb);
        }
      });
      setToolBarActionsList(tbList);
    }
  }, [toolBarActions]);

  // 表格列更新
  useEffect(() => {
    const newColumns = columns ? [...columns] : [];

    if (operateBar && operateBar.length > 0) {
      newColumns.push({
        title: I18n.text('form.operate'),
        width: 160,
        fixed: 'right',
        ...operteBarProps,
        hideInSearch: true,
        render: (dom, record) => {
          const nodes: React.ReactNode[] = [];

          operateBar.forEach((ob) => {
            if (typeof ob === 'function') {
              nodes.push(ob(dom, record));
              return;
            }

            if (ob.type === 'read') {
              nodes.push(
                <Auth.A
                  key={`lt-page-auth-read-${record[rowKey]}`}
                  domKey={`lt-page-auth-read-${record[rowKey]}`}
                  text={defautlTitle.read}
                  {...ob.props}
                  permission={ob.permission}
                  onClick={() => {
                    if (perStatusChange('read') === false) {
                      return;
                    }
                    modalRef.current?.read(formData(record));
                  }}
                />,
              );
            } else if (ob.type === 'edit') {
              nodes.push(
                <Auth.A
                  key={`lt-page-auth-edit-${record[rowKey]}`}
                  domKey={`lt-page-auth-edit-${record[rowKey]}`}
                  text={defautlTitle.edit}
                  {...ob.props}
                  permission={ob.permission}
                  onClick={() => {
                    if (perStatusChange('edit') === false) {
                      return;
                    }
                    modalRef.current?.edit(formData(record));
                  }}
                />,
              );
            } else {
              nodes.push(
                <Auth.A
                  key={`lt-page-auth-del-${record[rowKey]}`}
                  domKey={`lt-page-auth-del-${record[rowKey]}`}
                  text={defautlTitle.del}
                  confirmTitle={I18n.text('form.del.config')}
                  {...ob.props}
                  style={{ color: '#ff4d4f', ...ob.props?.style }}
                  permission={ob.permission}
                  onClick={() => {
                    if (del === undefined) {
                      I18n.error({ key: 'orm.error.request', params: { title: defautlTitle.del } });
                      return;
                    }
                    del(record).then(() => {
                      tableRef.current?.reload();
                      I18n.success('global.operation.success');
                    });
                  }}
                />,
              );
            }
          });

          return <Auth.Group key={`lt-page-auth-group-${record[rowKey]}`}>{nodes}</Auth.Group>;
        },
      });
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