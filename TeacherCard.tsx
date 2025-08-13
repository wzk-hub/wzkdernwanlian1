import { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { cn, calculateDisplayPrice } from '@/lib/utils';
import { toast } from 'sonner';

// 老师信息接口定义
interface Teacher {
  id: string;
  name: string;
  avatar?: string;
  subject: string;
  grade: string[];
  introduction: string;
  experience: string;
  rating: number;
  price: number;
  studentsCount: number;
}

// 老师卡片组件
interface TeacherCardProps {
  teacher: Teacher;
  onContact?: (teacherId: string) => void;
  onSelectAndPay?: (teacherId: string) => void;
}

export default function TeacherCard({ teacher, onContact, onSelectAndPay }: TeacherCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // 生成老师头像URL
  const avatarUrl = teacher.avatar || `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Teacher+avatar+${teacher.name}+professional+education+portrait&sign=3a7f8d9c0e1b2c3d4e5f6a7b8c9d0e1f`;
  
  // 处理联系老师按钮点击
  const handleContact = () => {
    if (onContact) {
      onContact(teacher.id);
    } else {
      toast.info(`已发送联系请求给${teacher.name}老师`);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
      {/* 老师基本信息 */}
      <div className="p-6">
        <div className="flex items-start">
          {/* 头像 */}
          <div className="relative mr-4">
            <img 
              src={avatarUrl} 
              alt={teacher.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
            />
            {/* 评分 */}
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
              {teacher.rating}
            </div>
          </div>
          
          {/* 基本信息 */}
          <div className="flex-1 min-w-0">
           <div className="flex flex-col items-start">
             <h3 className="text-xl font-bold text-gray-800 truncate">{teacher.name}</h3>
             <div className="flex flex-wrap gap-2 mt-1">
               {teacher.subjects?.map((subject) => (
                 <span key={subject} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                   {getSubjectName(subject)}老师
                 </span>
               ))}
             </div>
           </div>
            
            <div className="mt-1 flex flex-wrap gap-2">
              {teacher.grade.map((grade) => (
                <span key={grade} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {getGradeName(grade)}
                </span>
              ))}
            </div>
            
            <div className="mt-2 flex items-center text-gray-600 text-sm">
              <i class="fa-solid fa-user-graduate mr-1"></i>
              <span>{teacher.studentsCount}名学生</span>
              <span className="mx-2">•</span>
                 <i class="fa-solid fa-yen-sign mr-1"></i>
              <span>{calculateDisplayPrice(teacher.price)}元/小时</span>
            </div>
          </div>
        </div>
        
        {/* 简介 */}
        <div className="mt-4">
          <p className="text-gray-600 text-sm line-clamp-2">
            {teacher.introduction}
          </p>
          
          {/* 展开/收起详情按钮 */}
          {teacher.introduction.length > 100 && (
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-800 transition-colors"
            >
              {showDetails ? '收起详情' : '查看更多'}
              <i className={`fa-solid ml-1 ${showDetails ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </button>
          )}
          
          {/* 详细信息 */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-gray-600 text-sm">{teacher.introduction}</p>
              
              <div className="mt-3">
                <h4 className="font-medium text-gray-800 text-sm mb-1">教学经验</h4>
                <p className="text-gray-600 text-sm">{teacher.experience}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* 联系按钮 */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button 
              onClick={handleContact}
              className="py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <i class="fa-solid fa-comment mr-2"></i>咨询
            </button>
             <button 
                onClick={() => onSelectAndPay?.(teacher.id)}
               className="py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <i class="fa-solid fa-check mr-2"></i>选择并支付
            </button>
          </div>
      </div>
    </div>
  );
}

 // 科目英文转中文名称
 function getSubjectName(subject: string): string {
   const subjectMap: Record<string, string> = {
     'math': '数学',
     'chinese': '语文',
     'english': '英语',
     'physics': '物理',
     'chemistry': '化学',
     'biology': '生物',
     'history': '历史',
     'geography': '地理',
     'politics': '政治'
   };
   
   return subjectMap[subject] || subject;
 }
 
 // 年级数字转中文名称
 function getGradeName(grade: string): string {
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
 }