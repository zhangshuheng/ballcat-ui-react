import type { IntlShape } from 'react-intl';
import { message } from 'antd';
import type { ConfigOnClose } from 'antd/lib/message';
import { get } from './Ballcat';
import { settings } from './ConfigUtils';

export type I18nParams =
  | string
  | {
      key: string;
      params: Record<string, string>;
      defaultMessage?: string;
    };

export type MessageParams = {
  duration?: number | (() => void);
  onClose?: ConfigOnClose;
};

let intl: IntlShape;
const I18n = {
  setIntl: (it: IntlShape) => {
    intl = it;
  },
  getIntl: () => intl,
  getLocal: () => {
    const local = get('umi_locale');
    if (local && local.length > 0) {
      return local;
    }
    return settings.defaultLocal;
  },
  text: (key: string, params?: Record<string, string>, defaultMessage = key) => {
    return I18n.getIntl().formatMessage({ id: key, defaultMessage }, params);
  },
  open: (
    ip: I18nParams,
    type: 'info' | 'success' | 'error' | 'warning' | 'loading',
    mp?: MessageParams,
  ) => {
    const text =
      typeof ip === 'string' ? I18n.text(ip) : I18n.text(ip.key, ip.params, ip.defaultMessage);
    return message[type](text, mp && mp.duration, mp && mp.onClose);
  },
  info: (ip: I18nParams, mp?: MessageParams) => {
    return I18n.open(ip, 'info', mp);
  },
  success: (ip: I18nParams, mp?: MessageParams) => {
    return I18n.open(ip, 'success', mp);
  },
  error: (ip: I18nParams, mp?: MessageParams) => {
    return I18n.open(ip, 'error', mp);
  },
  warning: (ip: I18nParams, mp?: MessageParams) => {
    return I18n.open(ip, 'warning', mp);
  },
  loading: (ip: I18nParams, mp?: MessageParams) => {
    return I18n.open(ip, 'loading', mp);
  },
};

export default I18n;