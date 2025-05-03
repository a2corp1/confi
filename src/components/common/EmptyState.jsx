import { InboxIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ 
  icon = <InboxIcon className="h-12 w-12 text-dark-500" />,
  title = 'No data available',
  description = 'There is currently no data to display.',
  action = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-dark-800 p-4 mb-4">
        {icon}
      </div>
      <h3 className="mt-2 text-lg font-medium text-dark-200">{title}</h3>
      <p className="mt-1 text-sm text-dark-400 max-w-md">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;