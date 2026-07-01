interface DepartmentWidgetDto {
  departmentName: string[];
  bookCount: number[];
}

interface CategoryWidgetDto {
  categoryName: string[];
  bookCount: number[];
}
interface MonthilyActivityWidget {
  monthName: string[];
  bookCount: number[];
}

interface DepartmentPerformanceWidget {
  departmentName: string[];
  bookCount: number[];
  downloadCount: number[];
  utilizationRate: number[];
}

interface YearPopularityWidget {
  year: string[];
  bookCount: number[];
  downloadCount: number[];
}

interface CategoryDepartmentWidget {
  categories: string[];
  departments: string[];
  matrix: number[][];
}

interface DataQualityWidget {
  totalCount: number;
  completeCount: number;
  missingCount: number;
  completePercentage: number;
}
