import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown } from "lucide-react";

export default function FilterPanel({ activeFilters, onFiltersChange, documents }) {
  const updateFilter = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = Object.values(activeFilters).filter(f => f !== "all").length;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="gap-2">
        <Filter className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            Status: {activeFilters.status === "all" ? "All" : activeFilters.status}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => updateFilter("status", "all")}>
            All Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFilter("status", "uploaded")}>
            Uploaded
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFilter("status", "processing")}>
            Processing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFilter("status", "analyzed")}>
            Analyzed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFilter("status", "redacted")}>
            Redacted
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            Risk: {activeFilters.riskLevel === "all" ? "All" : activeFilters.riskLevel}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => updateFilter("riskLevel", "all")}>
            All Levels
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFilter("riskLevel", "low")}>
            Low Risk
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFilter("riskLevel", "medium")}>
            Medium Risk
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFilter("riskLevel", "high")}>
            High Risk
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}