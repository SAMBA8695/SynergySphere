'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Link href="/tasks" className="text-sm text-blue-600 hover:underline">← Back to Tasks</Link>
      <h1 className="text-2xl font-bold text-gray-900">Task #{taskId}</h1>
      <div className="bg-white rounded-2xl shadow p-6 text-gray-600">
        <p>
          The API does not expose a single task lookup endpoint. Navigate to{' '}
          <Link href="/projects" className="text-blue-600 hover:underline">Projects</Link>{' '}
          and open the relevant project to view and manage individual tasks.
        </p>
      </div>
    </div>
  );
}