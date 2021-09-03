import type { SysDictDataItem } from '@/services/ballcat/system';
import type { CSSProperties } from 'react';

export type DictProps = {
  code: string;
  value?: any;
  onChange?: (val: any) => void;
  style?: CSSProperties;
};

export type DictMultipartProps = {
  // 显隐字典项过滤. 返回true则展示, 返回false则隐藏
  showFilter?: (item: SysDictDataItem) => boolean;
  // 禁用字典项过滤. 返回true则禁用, 返回false则正常显示
  disabledFilter?: (item: SysDictDataItem) => boolean;
};

export type DictRadioProps = {
  // 展示文本演示
  showTextColor?: boolean;
  // 默认样式, 可以指定成 按钮 样式
  radioType?: 'button';
} & DictProps &
  DictMultipartProps;
