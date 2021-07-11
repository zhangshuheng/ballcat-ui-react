import React from 'react';
import { Alert, Card, Typography } from 'antd';
import { FormattedMessage } from 'umi';
// @ts-ignore
import styles from './Welcome.less';

const CodePreview: React.FC = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default (): React.ReactNode => {
  return (
    <Card>
      <Alert
        message={'12313221321'}
        type="success"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
      <Typography.Text strong>
        <FormattedMessage id="pages.welcome.advancedComponent" defaultMessage="高级表格" />{' '}
        <a
          href="https://procomponents.ant.design/components/table"
          rel="noopener noreferrer"
          target="__blank"
        >
          <FormattedMessage id="pages.welcome.link" defaultMessage="欢迎使用" />
        </a>
      </Typography.Text>
      <CodePreview>yarn add @ant-design/pro-table</CodePreview>
      <Typography.Text
        strong
        style={{
          marginBottom: 12,
        }}
      >
        <FormattedMessage id="pages.welcome.advancedLayout" defaultMessage="高级布局" />{' '}
        <a
          href="https://procomponents.ant.design/components/layout"
          rel="noopener noreferrer"
          target="__blank"
        >
          <FormattedMessage id="pages.welcome.link" defaultMessage="欢迎使用" />
        </a>
      </Typography.Text>
      <CodePreview>yarn add @ant-design/pro-layout</CodePreview>
    </Card>
  );
};