const pipelineData = [
  {
    stage: "New",
    count: 120,
    color: "bg-blue-500",
  },
  {
    stage: "Contacted",
    count: 95,
    color: "bg-indigo-500",
  },
  {
    stage: "Qualified",
    count: 70,
    color: "bg-purple-500",
  },
  {
    stage: "Converted",
    count: 45,
    color: "bg-green-500",
  },
  {
    stage: "Lost",
    count: 25,
    color: "bg-red-500",
  },
];

function LeadPipeline() {
  // Find the highest lead count
  const maxCount = Math.max(
    ...pipelineData.map((item) => item.count)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          Lead Pipeline
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Track leads across different stages
        </p>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-5">
        {pipelineData.map((item) => {
          const percentage = (item.count / maxCount) * 100;

          return (
            <div key={item.stage}>
              {/* Stage Name and Count */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {item.stage}
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {item.count}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LeadPipeline;
