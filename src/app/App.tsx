import { useSystemHealth } from '@/features/system/api/use-system-health';

export function App() {
  const { data, isLoading, error } = useSystemHealth();

  return (
    <main className="p-4">
      <h1>Kokpit</h1>
      <p>Project foundation is ready. The workspace is not implemented yet.</p>
      <div className="mt-4 text-sm">
        <span>Backend status: </span>
        {isLoading && <span>Checking health...</span>}
        {error && <span>Health check failed ({error.message})</span>}
        {data && <span>Connected (status: {data.status})</span>}
      </div>
    </main>
  );
}
