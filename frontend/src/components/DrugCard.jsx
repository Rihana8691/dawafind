export default function DrugCard({ drug, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-lg px-4 py-3 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-100'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-800">{drug.brand_name}</h3>
          <p className="text-sm text-gray-500">{drug.generic_name}</p>
        </div>
        <div className="text-right">
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
            {drug.category}
          </span>
          <p className="text-xs text-gray-400 mt-1">{drug.dosage_form} · {drug.strength}</p>
        </div>
      </div>
      {drug.description && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-1">{drug.description}</p>
      )}
    </div>
  )
}