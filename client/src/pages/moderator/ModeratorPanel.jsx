export default function ModeratorPanel() {
  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold mb-2">Moderator Panel</h1>
      <p className="text-gray-600">Review and manage community content. (Placeholder)</p>
      <div className="mt-6 grid gap-3">
        <div className="p-4 rounded-lg bg-white shadow-sm border">Pending posts queue (TBD)</div>
        <div className="p-4 rounded-lg bg-white shadow-sm border">User reports (TBD)</div>
        <div className="p-4 rounded-lg bg-white shadow-sm border">Activity log (TBD)</div>
      </div>
    </div>
  );
}
