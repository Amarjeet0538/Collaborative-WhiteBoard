import { Search, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

export default function BoardFilters({ onSearch, onDateFilter, onSort }) {
  const { register, setValue, control } = useForm({
    defaultValues: {
      boardName: "",
      startDate: "",
      endDate: "",
      filters: "recent",
    },
  });

  const [startDate, endDate] = useWatch({
    control,
    name: ["startDate", "endDate"],
  });
  const hasDateFilter = startDate || endDate;

  const clearDates = () => {
    setValue("startDate", "");
    setValue("endDate", "");
    onDateFilter?.({ startDate: "", endDate: "" });
  };

  return (
    <div className="flex justify-between relative bg-background w-full p-2 text-foreground rounded-lg shadow-sm gap-4">
      {/* Search Input */}
      <div className="w-1/3 relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
        />
        <input
          {...register("boardName")}
          type="text"
          className="border rounded-md pl-10 p-1.5 w-full bg-background text-lg border-border-muted focus:ring-1 focus:ring-border focus:outline-none"
          placeholder="Search WhiteBoards..."
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      {/* Date Range + Sort */}
      <div className="flex gap-5 items-center">
        <div className="flex items-center bg-background border border-border-muted rounded-md px-2 focus-within:ring-1 focus-within:border-border focus-within:ring-border transition-all">
          <input
            {...register("startDate")}
            type="date"
            className="bg-transparent border-none p-2 text-foreground focus:outline-none cursor-pointer"
            title="Start Date"
            onChange={(e) =>
              onDateFilter?.({
                startDate: e.target.value,
                endDate: endDate || "",
              })
            }
          />
          <span className="text-foreground-muted px-1">to</span>
          <input
            {...register("endDate")}
            type="date"
            className="bg-transparent border-none p-2 text-foreground focus:outline-none cursor-pointer"
            title="End Date"
            onChange={(e) =>
              onDateFilter?.({
                startDate: startDate || "",
                endDate: e.target.value,
              })
            }
          />
          {hasDateFilter && (
            <button
              type="button"
              onClick={clearDates}
              className="p-2 ml-1 text-foreground-muted hover:text-danger hover:bg-background-highlight rounded-md transition-colors"
              title="Clear dates"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          {...register("filters")}
          className="border rounded-md p-2.5 bg-background focus:ring-1 border-border-muted focus:ring-border focus:outline-none"
          onChange={(e) => onSort?.(e.target.value)}
        >
          <option value="recent">Recents</option>
          <option value="a-z">Alphabetically (A-Z)</option>
          <option value="z-a">Alphabetically (Z-A)</option>
        </select>
      </div>
    </div>
  );
}
