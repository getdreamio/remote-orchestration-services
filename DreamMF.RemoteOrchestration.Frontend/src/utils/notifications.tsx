import { notification } from 'antd';
import { CheckCircleFilled, ExclamationCircleFilled, InfoCircleFilled, CloseCircleFilled } from '@ant-design/icons';

// Initialize notification settings
notification.config({
  top: 24,
  duration: 1000,
  maxCount: 1,
  placement: 'topRight',
});

type NotificationType = 'success' | 'error' | 'info' | 'warning';

const icons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircleFilled className="notification-icon notification-icon-success" style={{ fontSize: '22px' }} />,
  error: <CloseCircleFilled className="notification-icon notification-icon-error" style={{ fontSize: '22px' }} />,
  info: <InfoCircleFilled className="notification-icon notification-icon-info" style={{ fontSize: '22px' }} />,
  warning: <ExclamationCircleFilled className="notification-icon notification-icon-warning" style={{ fontSize: '22px' }} />,
};

const notify = {
  success: (message: string, description?: string) => {
    notification.success({
      message,
      description,
      icon: icons.success,
      className: 'notification-success',
    });
  },

  error: (message: string, description?: string) => {
    notification.error({
      message,
      description,
      icon: icons.error,
      className: 'notification-error',
    });
  },

  info: (message: string, description?: string) => {
    notification.info({
      message,
      description,
      icon: icons.info,
      className: 'notification-info',
    });
  },

  warning: (message: string, description?: string) => {
    notification.warning({
      message,
      description,
      icon: icons.warning,
      className: 'notification-warning',
    });
  },
};

export default notify;
