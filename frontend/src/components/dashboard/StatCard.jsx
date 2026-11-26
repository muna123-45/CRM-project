function StatCard({ title, value, change, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Icon and Percentage */}
      <div className="flex items-center justify-between">

        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={22} />
        </div>

        <span className="text-xs font-semibold text-green-600">
          {change}
        </span>

      </div>

      {/* Card Information */}
      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <h3 className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </h3>

    </div>
  );
}

export default StatCard;
