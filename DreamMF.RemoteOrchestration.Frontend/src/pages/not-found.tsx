import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Helmet } from 'react-helmet';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>[ROS] | Not Found</title>
                <meta name="description" content="Dream.mf [ROS] | Not Found Page" />
            </Helmet>
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Home className="h-4 w-4" />
                    Go Home
                </button>
            </div>
        </>
    );
}

export default NotFoundPage;
