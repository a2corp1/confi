import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-white">Page Not Found</h2>
        <p className="mt-2 text-lg text-dark-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Button as="link" to="/" size="lg">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;