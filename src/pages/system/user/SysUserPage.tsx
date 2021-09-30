import type { SysUserDto, SysUserQo, SysUserVo } from '@/services/ballcat/system';
import { organization } from '@/services/ballcat/system';
import TreeUtils from '@/utils/TreeUtils';
import {
  message,
  Tree,
  Input,
  Col,
  Row,
  Card,
  Select,
  Avatar,
  Badge,
  TreeSelect,
  Form,
  Dropdown,
  Menu,
  Popconfirm,
  Button,
} from 'antd';
import { useState, useEffect, useRef } from 'react';
import type { Key } from 'rc-tree/lib/interface';
import Icon from '@/components/Icon';
import { user } from '@/services/ballcat/system';
import LtPage from '@/components/LtPage';
import { ProFormRadio, ProFormText } from '@ant-design/pro-form';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import SrcUtils from '@/utils/SrcUtils';
import { DictTag } from '@/components/Dict';
import type { FormStatus, ModalFormRef } from '@/components/LtForm';
import { LtFormDictRadio } from '@/components/LtForm';
import { pwd } from '@/utils/Encrypt';
import SelectRole from './SelectRole';
import Auth from '@/components/Auth';
import Grant from './Grant';
import Pass from './Pass';
import LtCropper from '@/components/LtCropper';

export default () => {
  const tableRef = useRef<ActionType>();
  const modalRef = useRef<ModalFormRef<SysUserDto>>();

  const [treeData, setTreeData] = useState<any[]>([]);
  const [treeHighData, setTreeHighData] = useState<any[]>([]);
  const [treeExpandKeys, setTreeExpandKeys] = useState<Key[]>([]);
  const [treeSeachValue, setTreeSeachValue] = useState<string>();
  const [treeSelect, setTreeSelect] = useState<Key[]>([]);

  const loadTreeData = () => {
    setTreeData([]);
    organization.query().then((res) => {
      const tree = TreeUtils.toTreeData(res.data as unknown as any[], (item) => {
        return { ...item, label: item.name, value: item.id };
      });
      setTreeData(tree || []);
    });
  };

  const highTreeData = (filterData: any[]): any[] => {
    const highData = filterData.map((item) => {
      let { title } = item;

      const index =
        treeSeachValue === undefined || treeSeachValue === null || treeSeachValue.length === 0
          ? -1
          : title.indexOf(treeSeachValue);
      if (index !== -1 && treeSeachValue !== undefined) {
        const befor = title.substr(0, index);
        const after = title.substr(index + treeSeachValue.length);
        title = (
          <span>
            {befor} <span style={{ color: '#f50' }}>{treeSeachValue}</span> {after}
          </span>
        );
        treeExpandKeys.push(item.key);
      } else {
        title = <span>{title}</span>;
      }

      return {
        ...item,
        title,
        children: item.children ? highTreeData(item.children) : undefined,
      };
    });

    setTreeExpandKeys([...treeExpandKeys]);
    return highData;
  };

  const [status, setStatus] = useState<FormStatus>(undefined);
  const [grateVisible, setgrateVisible] = useState(false);
  const [grateRecord, setGrateRecord] = useState<SysUserVo>();

  const [passVisible, setPassVisible] = useState(false);
  const [passRecord, setPassRecord] = useState<SysUserVo>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [avatarData, setAvatarData] = useState<SysUserVo>();

  useEffect(() => {
    loadTreeData();
  }, []);

  useEffect(() => {
    setTreeHighData(highTreeData(treeData));
  }, [treeData, treeSeachValue]);

  const dataColumns: ProColumns<SysUserVo>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      align: 'center',
      order: 2,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      align: 'center',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      align: 'center',
      hideInSearch: true,
      render: (dom, record) => {
        return (
          <span onClick={() => setAvatarData(record)}>
            <Avatar
              alt="avatar"
              shape="square"
              size="large"
              style={{ cursor: 'pointer' }}
              icon={<Icon type="user" />}
              src={SrcUtils.resolve(record.avatar)}
            />
          </span>
        );
      },
    },
    {
      title: '性别',
      dataIndex: 'sex',
      align: 'center',
      hideInSearch: true,
      render: (dom, record) => {
        return <DictTag code="gender" value={record.sex} />;
      },
    },
    {
      title: '组织',
      dataIndex: 'organizationName',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      align: 'center',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      align: 'center',
      hideInTable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: '80px',
      order: 1,
      render: (dom, record) => {
        return (
          <Badge
            text={record.status === 0 ? '关闭' : '正常'}
            status={record.status === 0 ? 'default' : 'processing'}
          />
        );
      },
      renderFormItem: () => {
        return (
          <Select allowClear placeholder="请选择">
            <Select.Option value="1">正常</Select.Option>
            <Select.Option value="0">关闭</Select.Option>
          </Select>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      hideInSearch: true,
      width: '150px',
      sorter: true,
    },
  ];

  return (
    <>
      <Row gutter={14}>
        <Col md={5}>
          <Card loading={treeData.length === 0}>
            <Input
              allowClear
              placeholder="输入内容以搜索组织"
              style={{ marginBottom: 5 }}
              addonAfter={
                <Icon type="redo" style={{ fontSize: 18 }} onClick={() => loadTreeData()} />
              }
              onChange={(e) => {
                setTreeSeachValue(e.target.value);
              }}
            />
            <Tree
              multiple
              blockNode
              autoExpandParent
              treeData={treeHighData}
              selectedKeys={treeSelect}
              expandedKeys={treeExpandKeys}
              onExpand={(e) => {
                setTreeExpandKeys(e);
              }}
              onSelect={(keys) => {
                setTreeSelect(keys);
              }}
            />
          </Card>
        </Col>
        <Col md={19}>
          <LtPage.Modal<SysUserVo, SysUserQo, SysUserDto>
            {...user}
            title="系统用户"
            rowKey="userId"
            columns={dataColumns}
            tableRef={tableRef}
            modalRef={modalRef}
            handlerData={(body, st) => {
              if (st === 'create') {
                return { ...body, pass: pwd.encrypt(body.pass) };
              }
              return body;
            }}
            operateBar={[
              (dom, record) => {
                return (
                  <Dropdown
                    key={`user-operte-${record.userId}`}
                    overlay={
                      <Menu key={`user-menu-${record.userId}`}>
                        <Auth
                          key={`user-edit-auth-${record.userId}`}
                          permission="system:user:edit"
                          render={() => (
                            <Menu.Item key={`user-edit-item-${record.userId}`}>
                              <a
                                onClick={() =>
                                  modalRef.current?.edit(record as unknown as SysUserDto)
                                }
                              >
                                编辑
                              </a>
                            </Menu.Item>
                          )}
                        />
                        <Auth
                          key={`user-grant-auth-${record.userId}`}
                          permission="system:user:grant"
                          render={() => (
                            <Menu.Item key={`user-grant-item-${record.userId}`}>
                              <a
                                onClick={() => {
                                  setGrateRecord(record);
                                  setgrateVisible(true);
                                }}
                              >
                                授权
                              </a>
                            </Menu.Item>
                          )}
                        />
                        <Auth
                          key={`user-pass-auth-${record.userId}`}
                          permission="system:user:pass"
                          render={() => (
                            <Menu.Item key={`user-pass-item-${record.userId}`}>
                              <a
                                onClick={() => {
                                  setPassRecord(record);
                                  setPassVisible(true);
                                }}
                              >
                                改密
                              </a>
                            </Menu.Item>
                          )}
                        />
                        <Auth
                          key={`user-del-auth-${record.userId}`}
                          permission="system:user:del"
                          render={() => (
                            <Menu.Item key={`user-del-item-${record.userId}`}>
                              <Popconfirm
                                key="user-del-popconfirm"
                                title={`确认要删除吗?`}
                                overlayStyle={{ width: '150px' }}
                                onConfirm={() => {
                                  user.del(record).then(() => {
                                    message.success('删除成功!');
                                    tableRef.current?.reload();
                                  });
                                }}
                              >
                                <a style={{ color: 'red' }}>删除</a>
                              </Popconfirm>
                            </Menu.Item>
                          )}
                        />
                      </Menu>
                    }
                  >
                    <a style={{ userSelect: 'none' }}>操作</a>
                  </Dropdown>
                );
              },
            ]}
            operteBarProps={{ width: 70 }}
            toolBarActions={[
              selectedRowKeys && selectedRowKeys.length > 0 ? (
                <Dropdown
                  overlay={
                    <Menu
                      key="multiple-dropdown"
                      onClick={({ key }) => {
                        user.updateStatus(selectedRowKeys, key === 'open' ? 1 : 0).then(() => {
                          message.success('操作成功!');
                          tableRef.current?.reload();
                        });
                      }}
                    >
                      <Menu.Item key="open">
                        <Icon type="delete" style={{ marginRight: '10px' }} />
                        开启
                      </Menu.Item>
                      <Menu.Item key="lock">
                        <Icon type="lock" style={{ marginRight: '10px' }} />
                        锁定
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button>
                    批量操作
                    <Icon type="down" style={{ marginLeft: '5px' }} />
                  </Button>
                </Dropdown>
              ) : (
                <></>
              ),

              { type: 'create', permission: 'system:user:add' },
            ]}
            tableProps={{
              params: {
                // @ts-ignore
                organizationId:
                  treeSelect && treeSelect.length > 0 ? treeSelect.join(',') : undefined,
              },
              rowSelection: {
                fixed: true,
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => {
                  setSelectedRowKeys(keys);
                },
              },
              alwaysShowAlert: true,
              tableAlertOptionRender: false,
              tableAlertRender: () => {
                return (
                  <>
                    <Icon
                      type="info-circle-fill"
                      style={{ color: '#1890ff', marginRight: 5, fontSize: 14 }}
                    />
                    已选择: <span style={{ color: '#1890ff' }}>{selectedRowKeys.length}</span>
                    <a onClick={() => setSelectedRowKeys([])} style={{ marginLeft: '24px' }}>
                      清空
                    </a>
                  </>
                );
              },
            }}
            modalProps={{ titleSuffix: '用户' }}
            onStatusChange={setStatus}
          >
            <Row>
              <Col xs={24} sm={24} md={12}>
                <ProFormText name="userId" hidden />
                <ProFormText
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名!' }]}
                />

                {status === 'edit' ? (
                  <></>
                ) : (
                  <ProFormText.Password
                    name="pass"
                    label="密码"
                    rules={[{ required: true, message: '请输入密码!' }]}
                  />
                )}

                <ProFormText
                  name="nickname"
                  label="昵称"
                  rules={[{ required: true, message: '请输入昵称!' }]}
                />

                <Form.Item name="organizationId" label="组织">
                  <TreeSelect treeData={treeData} />
                </Form.Item>

                <ProFormRadio.Group
                  name="status"
                  label="状态"
                  radioType="button"
                  initialValue={1}
                  options={[
                    { value: 1, label: '正常' },
                    { value: 0, label: '关闭' },
                  ]}
                />
              </Col>

              <Col xs={24} sm={24} md={12}>
                <LtFormDictRadio
                  name="sex"
                  label="性别"
                  code="gender"
                  dictProps={{ radioType: 'button' }}
                  initialValue={1}
                />

                <ProFormText name="phone" label="电话" />

                <ProFormText name="email" label="邮箱" />

                {status === 'edit' ? (
                  <></>
                ) : (
                  <Form.Item name="roleCodes" label="角色" initialValue={[]}>
                    <SelectRole />
                  </Form.Item>
                )}
              </Col>
            </Row>
          </LtPage.Modal>
        </Col>
      </Row>

      <Grant visible={grateVisible} onVisibleChange={setgrateVisible} record={grateRecord} />

      <Pass visible={passVisible} onVisibleChange={setPassVisible} record={passRecord} />

      <LtCropper.Avatar
        visible={avatarData !== undefined}
        onVisibleChange={(flag) => {
          if (!flag) {
            setAvatarData(undefined);
          }
        }}
        onSave={async (blob, file) => {
          if (!avatarData) {
            message.error('请指定要更新头像的用户!');
            setAvatarData(undefined);
            return;
          }
          return user.updateAvatar(avatarData, blob, file).then(() => setAvatarData(undefined));
        }}
      />
    </>
  );
};