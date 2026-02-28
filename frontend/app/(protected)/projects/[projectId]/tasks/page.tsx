'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectTasksRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/projects/${params.projectId}`);
  }, [params.projectId, router]);

  return (
    <div className="flex justify-center items-center py-32">
      <p className="text-gray-500 animate-pulse">Redirecting...</p>
    </div>
  );
}