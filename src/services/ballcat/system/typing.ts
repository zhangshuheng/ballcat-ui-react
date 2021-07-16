export type SysUserVo = {
  // 用户ID
  userId: number;
  // 登录账号
  username: string;
  // 昵称
  nickname: string;
  // 头像
  avatar: string;
  // 性别(0-默认未知,1-男,2-女)
  sex: 0 | 1 | 2;
  // 电子邮件
  email: string;
  // 电话
  phone: string;
  // 状态(1-正常, 0-冻结)
  status: 1 | 0;
  // 用户类型：1-系统用户，2-客户用户
  type: number;
  // 组织机构ID
  organizationId: number;
  // 组织机构名称
  organizationName: string;
  // 创建时间
  createTime: string;
  // 更新时间
  updateTime: string;
};

export type SysUserQo = {
  // 登录账号
  username: string;
  // 昵称
  nickname: string;
  // 性别(0-默认未知,1-男,2-女)
  sex: 0 | 1 | 2;
  // 电子邮件
  email: string;
  // 电话
  phone: string;
  // 状态(1-正常,2-冻结)
  status: 1 | 0;
  // organizationId
  organizationId: number[];
  // 用户类型:1:系统用户， 2：客户用户
  type: number;
  // 开始时间
  startTime: string;
  // 结束时间
  endTime: string;
};
