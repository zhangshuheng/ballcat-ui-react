import Page from '@/components/Page';
import { Badge, Button, Form as AntdForm, Space, Switch } from 'antd';
import type { AnnouncementDto, AnnouncementQo, AnnouncementVo } from '@/services/ballcat/notify';
import { announcement } from '@/services/ballcat/notify';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import I18n from '@/utils/I18nUtils';
import { DictSelect, DictTag } from '@/components/Dict';
import Auth from '@/components/Auth';
import { useRef, useState } from 'react';
import { ProFormDateTimePicker, ProFormText } from '@ant-design/pro-form';
import type { FullFormRef } from '@/components/Form';
import Form, { FormNumber } from '@/components/Form';
import SelectRole from '@/pages/system/user/SelectRole';
import SelectOrganization from './SelectOrganization';
import Lov from '@/components/Lov';
import Notify from '@/utils/NotifyUtils';
import Editor from '@/components/Editor';

const typeBadges: Record<
  number,
  {
    status: 'default' | 'processing' | 'warning' | 'success' | 'error';
    text: string;
    value: number;
  }
> = {
  0: {
    status: 'default',
    text: '已关闭',
    value: 0,
  },
  1: {
    status: 'processing',
    text: '已发布',
    value: 1,
  },
  2: {
    status: 'warning',
    text: '待发布',
    value: 2,
  },
};

const dataColumns: ProColumns<AnnouncementVo>[] = [
  {
    title: 'ID',
    width: 80,
    dataIndex: 'id',
    hideInSearch: true,
  },
  {
    title: '标题',
    dataIndex: 'title',
    ellipsis: true,
  },
  {
    title: '内容',
    dataIndex: 'content',
    width: 80,
    hideInSearch: true,
    render: (dom, record) => <a onClick={() => Notify.preview(record)}>预览</a>,
  },
  {
    title: '接收人范围',
    dataIndex: 'recipientFilterType',
    width: 110,
    render: (dom, record) => (
      <DictTag code="recipient_filter_type" value={record.recipientFilterType} />
    ),
    renderFormItem: () => <DictSelect code="recipient_filter_type" />,
  },
  {
    title: '接收方式',
    dataIndex: 'receiveMode',
    width: 240,
    hideInSearch: true,
    render: (dom, record) =>
      record.receiveMode.map((mode, index) => (
        <DictTag
          code="notify_channel"
          key={`receiveMode-${record.id}-${index.toString()}`}
          value={mode}
        />
      )),
  },
  {
    title: '状态',
    width: 100,
    dataIndex: 'status',
    hideInSearch: true,
    render: (dom, record) => {
      const typeBadge = typeBadges[record.status];
      return <Badge status={typeBadge.status} text={typeBadge.text} />;
    },
  },
  {
    title: '失效时间',
    dataIndex: 'deadline',
    width: 150,
    hideInSearch: true,
    renderText: (text, record) => (record.immortal ? '永久有效' : text),
  },
  {
    title: '创建人',
    hideInSearch: true,
    dataIndex: 'createUsername',
    ellipsis: true,
  },
  {
    title: '创建时间',
    hideInSearch: true,
    dataIndex: 'createTime',
    width: 150,
    sorter: true,
  },
];

const recipientFilterConditionNames: Record<number, string> = {
  1: 'recipientFilterCondition',
  2: 'recipientFilterConditionRule',
  3: 'recipientFilterConditionOrganization',
  4: 'recipientFilterConditionType',
  5: 'recipientFilterConditionUser',
};

export default () => {
  const tableRef = useRef<ActionType>();
  const formRef = useRef<FullFormRef<AnnouncementDto>>();

  const [loading, setLoading] = useState(false);

  const submit = (status: number) => {
    setLoading(true);
    const form = formRef.current?.getForm();
    form?.setFieldsValue({ status });
    form?.submit();
  };

  return (
    <>
      <Page.Full<AnnouncementVo, AnnouncementQo, AnnouncementDto>
        {...announcement}
        title="公告信息"
        rowKey="id"
        columns={dataColumns}
        tableRef={tableRef}
        tableProps={{
          loading,
          onLoadingChange: (flag) => {
            if (!flag) {
              setLoading(false);
            } else if (typeof flag === 'boolean') {
              setLoading(flag);
            } else {
              setLoading(!!flag.spinning);
            }
          },
          onLoad: () => setLoading(false),
          onRequestError: () => setLoading(false),
        }}
        toolBarActions={[{ type: 'create', permission: 'notify:announcement:add' }]}
        operateBar={[
          {
            type: 'edit',
            permission: 'notify:announcement:edit',
            props: (data) => ({ disabled: data.status !== 2 }),
          },
          (dom, data) => (
            <Auth.A
              permission="notify:announcement:edit"
              text="发布"
              confirmTitle="确认要发布吗?"
              key={`announcement-publish-${data.id}`}
              disabled={data.status !== 2}
              onClick={() => {
                setLoading(true);
                announcement.publish(data).then(() => {
                  setLoading(false);
                  I18n.success('通知发布操作成功!');
                  tableRef.current?.reload();
                });
              }}
            />
          ),
          (dom, data) => (
            <Auth.A
              permission="notify:announcement:edit"
              text="关闭"
              confirmTitle="确认要关闭吗?"
              key={`announcement-close-${data.id}`}
              disabled={data.status === 0}
              onClick={() => {
                setLoading(true);
                announcement.close(data).then(() => {
                  setLoading(false);
                  I18n.success('通知关闭操作成功!');
                  tableRef.current?.reload();
                });
              }}
            />
          ),
          { type: 'del', permission: 'notify:announcement:del' },
        ]}
        operateBarProps={{ width: 180 }}
        formData={(data) => {
          const nd = { ...data };
          nd[recipientFilterConditionNames[data.recipientFilterType]] =
            data.recipientFilterCondition;
          return nd;
        }}
        handlerData={(body) => {
          const data = {
            ...body,
            recipientFilterCondition: body[recipientFilterConditionNames[body.recipientFilterType]],
          };

          return data;
        }}
        formRef={formRef}
        formProps={{
          antProps: {
            submitter: {
              render: () => {
                const form = formRef.current?.getForm();

                return [
                  <div style={{ textAlign: 'center' }}>
                    <Space>
                      <Button
                        loading={loading}
                        onClick={() => {
                          // @ts-ignore
                          Notify.preview(form?.getFieldsValue());
                        }}
                      >
                        预览
                      </Button>
                      <Button loading={loading} type="primary" onClick={() => submit(2)}>
                        仅保存
                      </Button>
                      <Button loading={loading} type="primary" onClick={() => submit(1)}>
                        保存并发布
                      </Button>
                      <Button loading={loading} onClick={() => formRef.current?.hidden()}>
                        取消
                      </Button>
                    </Space>
                  </div>,
                ];
              },
            },
          },
        }}
        onFinish={() => {
          setLoading(false);
        }}
        onError={() => {
          setLoading(false);
        }}
      >
        <ProFormText hidden name="id" />

        <FormNumber hidden name="status" />

        <ProFormText
          label="标题"
          name="title"
          rules={[{ required: true, message: '请输入公告标题!' }]}
        />

        <AntdForm.Item
          label="内容"
          name="content"
          rules={[{ required: true, message: '请输入公告内容!' }]}
        >
          <Editor
            uploadImage={async (blobs: Blob[]) => {
              return announcement.uploadImage(blobs).then(({ data }) => {
                return data;
              });
            }}
          />
        </AntdForm.Item>

        <Form.DictSelect
          code="recipient_filter_type"
          label="筛选类型"
          name="recipientFilterType"
          rules={[{ required: true, message: '请选择筛选类型!' }]}
          initialValue={1}
        />

        <AntdForm.Item noStyle shouldUpdate>
          {(form) => {
            let recipientFilterConditionDom: React.ReactNode;
            const type = form.getFieldValue('recipientFilterType');

            switch (type) {
              // 角色 2
              case 2:
                recipientFilterConditionDom = <SelectRole />;
                break;
              // 组织 3
              case 3:
                recipientFilterConditionDom = <SelectOrganization />;
                break;
              // 类型 4
              case 4:
                recipientFilterConditionDom = (
                  <DictSelect multipar code="user_type" placeholder="请选择用户类型" />
                );
                break;
              // 用户 5
              case 5:
                recipientFilterConditionDom = <Lov keyword="LovUserMultiple" />;
                break;
              // 全部 1
              default:
                return <></>;
            }

            return (
              <AntdForm.Item
                label="筛选条件"
                name={recipientFilterConditionNames[type]}
                rules={[{ required: true, message: '请指定筛选条件!' }]}
                initialValue={[]}
              >
                {recipientFilterConditionDom}
              </AntdForm.Item>
            );
          }}
        </AntdForm.Item>

        <Form.DictCheckbox
          code="notify_channel"
          label="接收方式"
          name="receiveMode"
          rules={[{ required: true, message: '请选择接收方式!' }]}
        />

        <AntdForm.Item
          label="永久有效"
          name="immortal"
          valuePropName="checked"
          initialValue={1}
          getValueFromEvent={(flag: boolean) => {
            return flag ? 1 : 0;
          }}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </AntdForm.Item>

        <AntdForm.Item noStyle shouldUpdate>
          {(form) => {
            const immortal = form.getFieldValue('immortal');

            return immortal === 1 ? (
              <></>
            ) : (
              <ProFormDateTimePicker
                name="deadline"
                label="截止日期"
                rules={[{ required: true, message: '请选择截止日期' }]}
              />
            );
          }}
        </AntdForm.Item>
      </Page.Full>
    </>
  );
};
