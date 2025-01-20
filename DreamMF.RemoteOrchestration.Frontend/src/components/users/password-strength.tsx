import React from 'react';
import { Progress, Space, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PasswordRequirement {
    label: string;
    check: (password: string) => boolean;
}

interface PasswordStrengthProps {
    password: string;
}

const requirements: PasswordRequirement[] = [
    { 
        label: 'At least 8 characters long',
        check: (password) => password.length >= 8 
    },
    { 
        label: 'Contains uppercase letter',
        check: (password) => /[A-Z]/.test(password)
    },
    { 
        label: 'Contains lowercase letter',
        check: (password) => /[a-z]/.test(password)
    },
    { 
        label: 'Contains number',
        check: (password) => /\d/.test(password)
    },
    { 
        label: 'Contains special character',
        check: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
];

const getStrengthLevel = (password: string): number => {
    if (!password) return 0;
    const passedChecks = requirements.filter(req => req.check(password)).length;
    return Math.ceil((passedChecks / requirements.length) * 100);
};

const getStrengthColor = (strength: number): string => {
    if (strength < 40) return '#ff4d4f';
    if (strength < 70) return '#faad14';
    return '#52c41a';
};

const getStrengthText = (strength: number): string => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
};

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    if (!password) return null;
    
    const strength = getStrengthLevel(password);
    const color = getStrengthColor(strength);
    const strengthText = getStrengthText(strength);

    return (
        <div className="mt-2">
            <div className="mb-2">
                <Text className="text-sm">Password Strength: </Text>
                <Text className="text-sm" style={{ color }}>
                    {strengthText}
                </Text>
                <Progress 
                    percent={strength} 
                    strokeColor={color}
                    showInfo={false}
                    size="small"
                    className="mb-2"
                />
            </div>
            <div className="space-y-1">
                {requirements.map((req, index) => {
                    const passed = req.check(password);
                    return (
                        <div key={index} className="flex items-center gap-2">
                            {passed ? (
                                <CheckOutlined className="text-green-500" />
                            ) : (
                                <CloseOutlined className="text-red-500" />
                            )}
                            <Text className="text-sm">{req.label}</Text>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PasswordStrength;
