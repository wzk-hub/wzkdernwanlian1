import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// 年级筛选组件
interface GradeFilterProps {
  selectedGrades: string[];
  onChange: (grades: string[]) => void;
  allGrades?: string[];
}

export default function GradeFilter({ 
  selectedGrades, 
  onChange,
  allGrades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
}: GradeFilterProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedGrades);
  
  // 当外部selectedGrades变化时更新本地状态
  useEffect(() => {
    setLocalSelected(selectedGrades);
  }, [selectedGrades]);
  
  // 处理年级选择变化
  const handleGradeChange = (grade: string) => {
    let newSelected: string[];
    
    if (localSelected.includes(grade)) {
      newSelected = localSelected.filter(g => g !== grade);
    } else {
      newSelected = [...localSelected, grade];
    }
    
    setLocalSelected(newSelected);
    onChange(newSelected);
  };
  
  // 获取年级中文名称
  const getGradeName = (grade: string): string => {
    const gradeMap: Record<string, string> = {
      '1': '一年级',
      '2': '二年级',
      '3': '三年级',
      '4': '四年级',
      '5': '五年级',
      '6': '六年级',
      '7': '初一',
      '8': '初二',
      '9': '初三',
      '10': '高一',
      '11': '高二',
      '12': '高三'
    };
    
    return gradeMap[grade] || grade;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">按年级筛选</h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {allGrades.map(grade => (
          <button
            key={grade}
            onClick={() => handleGradeChange(grade)}
            className={cn(
              "py-2 px-3 rounded-lg text-sm font-medium transition-all",
              localSelected.includes(grade)
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {getGradeName(grade)}
          </button>
        ))}
      </div>
      
      {/* 清除筛选按钮 */}
      {localSelected.length > 0 && (
        <button
          onClick={() => {
            setLocalSelected([]);
            onChange([]);
          }}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <i class="fa-solid fa-times-circle mr-1"></i>
          清除筛选
        </button>
      )}
    </div>
  );
}