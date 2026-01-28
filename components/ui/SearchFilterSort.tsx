import { Search, Filter, ArrowUpDown } from "lucide-react";

interface SearchFilterSortProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  rating?: number;
  onRatingChange?: (value: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  itemsPerPageOptions?: number[];
  showStatusFilter?: boolean;
  showRatingFilter?: boolean;
  statusOptions?: { value: string; label: string }[];
  sortOptions?: { value: string; label: string }[];
  placeholder?: string;
  statusLabel?: string;
}

export default function SearchFilterSort({
  searchTerm,
  onSearchChange,
  sortBy = "",
  sortOrder = "desc",
  onSortChange,
  status = "",
  onStatusChange,
  rating,
  onRatingChange,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [6, 10, 20, 50],
  showStatusFilter = false,
  showRatingFilter = false,
  statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ],
  sortOptions = [
    { value: "created_at-desc", label: "Newest First" },
    { value: "created_at-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "updated_at-desc", label: "Recently Updated" },
    { value: "updated_at-asc", label: "Least Recently Updated" },
  ],
  placeholder = "Search...",
  statusLabel = "Status",
}: SearchFilterSortProps) {
  const getGridCols = () => {
    const filters = [];
    if (showStatusFilter) filters.push("status");
    if (showRatingFilter) filters.push("rating");
    if (onSortChange) filters.push("sort");
    filters.push("itemsPerPage");

    const totalFilters = filters.length + 1; // +1 for search
    if (totalFilters === 2) return "md:grid-cols-2";
    if (totalFilters === 3) return "md:grid-cols-3";
    if (totalFilters === 4) return "md:grid-cols-4";
    if (totalFilters === 5) return "md:grid-cols-5";
    return "lg:grid-cols-4";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className={`grid grid-cols-1 ${getGridCols()} gap-4`}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={status}
              onChange={(e) => onStatusChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rating Filter */}
        {showRatingFilter && (
          <div className="relative">
            <select
              value={rating || ""}
              onChange={(e) =>
                onRatingChange?.(e.target.value ? Number(e.target.value) : 0)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        )}

        {/* Sort By */}
        {onSortChange && (
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Items Per Page */}
        <div className="relative">
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
