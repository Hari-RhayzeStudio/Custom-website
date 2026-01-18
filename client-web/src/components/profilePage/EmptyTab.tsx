export default function EmptyTab({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-50 text-center animate-in fade-in zoom-in duration-300">
      <Icon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}