export default function Loading() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-pulse">
      <div className="h-14 bg-gray-200 rounded-full max-w-4xl mx-auto mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 h-100">
            <div className="aspect-square bg-gray-200 rounded-xl mb-6" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}