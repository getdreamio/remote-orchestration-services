import type React from 'react';
import { Button, Typography } from 'antd';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface ErrorDisplayProps {
    error?: Error;
    resetError?: () => void;
    message?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    resetError,
    message = 'Something went wrong'
}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="text-center space-y-6 max-w-lg">
                <div className="flex justify-center">
                    <AlertTriangle className="h-16 w-16 text-red-500" />
                </div>
                
                <div className="space-y-2">
                    <Title level={2}>{message}</Title>
                    {error && process.env.NODE_ENV === 'development' && (
                        <Text className="text-muted-foreground block">
                            {error.message}
                        </Text>
                    )}
                </div>

                <div className="space-x-4">
                    <Button onClick={() => navigate('/')}>
                        Go to Dashboard
                    </Button>
                    {resetError && (
                        <Button type="primary" onClick={resetError}>
                            Try Again
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;
