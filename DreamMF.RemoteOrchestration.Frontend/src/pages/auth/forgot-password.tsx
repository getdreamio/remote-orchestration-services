import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(values.email);
      setSuccess(true);
      form.resetFields();
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 16px' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Forgot Password
        </Title>

        {success ? (
          <Alert
            type="success"
            message="Password Reset Email Sent"
            description="Please check your email for instructions to reset your password."
            action={
              <Button size="small" type="primary" onClick={() => navigate('/auth/login')}>
                Return to Login
              </Button>
            }
            showIcon
            style={{ marginBottom: 24 }}
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
              name="forgotPassword"
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input size="large" placeholder="Enter your email address" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                >
                  Send Reset Instructions
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Text>
                  Remember your password?{' '}
                  <Button
                    type="link"
                    onClick={() => navigate('/auth/login')}
                    style={{ padding: 0 }}
                  >
                    Sign in
                  </Button>
                </Text>
              </div>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
