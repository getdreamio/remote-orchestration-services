import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Title } = Typography;

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 16px' }}>
        <Alert
          type="error"
          message="Invalid Reset Link"
          description="The password reset link is invalid or has expired. Please request a new password reset."
          action={
            <Button type="primary" onClick={() => navigate('/auth/forgot-password')}>
              Request New Reset
            </Button>
          }
          showIcon
        />
      </div>
    );
  }

  const onFinish = async (values: ResetPasswordFormData) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(token, values.password);
      setSuccess(true);
      form.resetFields();
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 16px' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Reset Password
        </Title>

        {success ? (
          <Alert
            type="success"
            message="Password Reset Successful"
            description="Your password has been successfully reset. You can now log in with your new password."
            action={
              <Button type="primary" onClick={() => navigate('/auth/login')}>
                Go to Login
              </Button>
            }
            showIcon
          />
        ) : (
          <>
            {error && (
              <Alert
                type="error"
                message={error}
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form
              form={form}
              name="resetPassword"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password size="large" placeholder="Enter your new password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                rules={[
                  { required: true, message: 'Please confirm your new password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password size="large" placeholder="Confirm your new password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                >
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
