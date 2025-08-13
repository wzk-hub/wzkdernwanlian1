import { StrictMode, useState, useEffect, useContext, createContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation, Outlet, useParams } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 工具函数
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

/**
 * 计算显示价格（加价20%）
 * @param originalPrice 原始价格
 * @returns 加价后的价格
 */
export function calculateDisplayPrice(originalPrice: number): number {
  return Math.round(originalPrice * 1.2)
}

/**
 * 格式化价格显示
 * @param price 价格数值
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

// 认证上下文
export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
  userRole: null as string | null,
  setUserRole: (role: string | null) => {},
  userId: null as string | null,
  setUserId: (id: string | null) => {},
  logout: () => {},
});

// 任务数据模型定义
export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'payment_pending' | 'paid' | 'assigned' | 'in_progress' | 'completed' | 'settled';

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  duration: number; // 课时数量
  price: number; // 总价格
  status: TaskStatus;
  publisherId: string; // 发布者ID（家长）
  publisherName?: string; // 发布者姓名
  assignedTeacherId?: string; // 被分配的老师ID
  assignedTeacherName?: string; // 被分配的老师姓名
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date; // 审核通过时间
  approvedById?: string; // 审核管理员ID
  paymentConfirmedAt?: Date; // 支付确认时间
  paymentConfirmedById?: string; // 确认支付的管理员ID
  completedAt?: Date; // 完成时间
  settledAt?: Date; // 结算时间
  settledById?: string; // 结算管理员ID
  paymentMethod?: 'wechat' | 'alipay'; // 支付方式
  paymentTransactionId?: string; // 支付交易ID
  rejectionReason?: string; // 拒绝原因
  chatGroupId?: string; // 关联的群聊ID
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  subject: string;
  grade: string;
  duration: number;
  price: number;
  teacherId: string; // 选择老师后必填
}

// 用户数据模型定义
export type UserRole = 'parent' | 'teacher' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'unverified';

export interface User {
  id: string;
  phone: string;
  password: string;
  role: UserRole;
  name?: string;
  avatar?: string;
  createdAt: Date;
  
  // 实名认证信息
  verificationStatus: VerificationStatus;
  realName?: string;
  idNumber?: string;
  idCardFront?: string;
  idCardBack?: string;
  verifiedAt?: Date;
  verifiedById?: string;
  
  // 家长特有信息
  childGrade?: string; // 孩子年级
  
  // 老师特有信息
  subjects?: string[]; // 教学科目，支持多个
  grade?: string[]; // 教授年级
  introduction?: string; // 个人简介
  experience?: string; // 教学经验
  price?: number; // 课时费用
  certificates?: string[]; // 资格证书
  paymentQrCode?: string; // 收款二维码
}

// 辅助函数：科目名称转换
function getSubjectName(subjectValue: string): string {
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
  
  return subjectMap[subjectValue] || subjectValue;
}

// 辅助函数：年级名称转换
function getGradeName(gradeValue: string): string {
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
  
  return gradeMap[gradeValue] || gradeValue;
}

// 空组件
function Empty() {
  return (
    <div className={cn("flex h-full items-center justify-center")} onClick={() => toast('Coming soon')}>Empty</div>
  );
}

// 年级筛选组件
interface GradeFilterProps {
  selectedGrades: string[];
  onChange: (grades: string[]) => void;
  allGrades?: string[];
}

function GradeFilter({ 
  selectedGrades, 
  onChange,
  allGrades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
}: GradeFilterProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedGrades);
  
  useEffect(() => {
    setLocalSelected(selectedGrades);
  }, [selectedGrades]);
  
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

// 导航栏组件
function Navbar() {
  const { isAuthenticated, userRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const logoUrl = "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=DeRunWanLian+Education+Logo+small+icon+Chinese+characters+professional+education+institution+blue+color&sign=e192a7cb5fd096a0861f59967642376f";
  
  return (
    <nav className={`w-full z-10 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logoUrl} 
              alt="德润万联教育" 
              className="h-10 w-10 rounded-md object-contain"
            />
            <span className="text-xl font-bold text-blue-800">德润万联</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">首页</Link>
            
            {isAuthenticated ? (
              <>
                {userRole === 'parent' && (
                  <>
                    <Link to="/parent/teachers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      老师列表
                    </Link>
                    <Link to="/parent/tasks" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      发布任务
                    </Link>
                  </>
                )}
                
                {userRole === 'teacher' && (
                  <>
                    <Link to="/teacher/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      个人资料
                    </Link>
                    <Link to="/teacher/tasks" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      任务中心
                    </Link>
                  </>
                )}
                
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin/users" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      用户管理
                    </Link>
                    <Link to="/admin/tasks" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      任务审核
                    </Link>
                    <Link to="/admin/statistics" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      数据统计
                    </Link>
                  </>
                )}
                
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  退出登录
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                登录/注册
              </Link>
            )}
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-700 focus:outline-none">
              <i class="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// 任务表单组件
interface TaskFormProps {
  initialData?: Partial<CreateTaskRequest>;
  onSubmit: (data: CreateTaskRequest) => void;
  isSubmitting: boolean;
}

function TaskForm({ initialData, onSubmit, isSubmitting }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    subject: initialData?.subject || '',
    grade: initialData?.grade || '',
    duration: initialData?.duration || 10,
    price: initialData?.price || 0,
    teacherId: initialData?.teacherId || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        title: initialData.title || prev.title,
        description: initialData.description || prev.description,
        subject: initialData.subject || prev.subject,
        grade: initialData.grade || prev.grade,
        duration: initialData.duration || prev.duration,
        price: initialData.price || prev.price,
      }));
    }
    
    if (initialData?.grade) {
      calculatePrice();
    }
  }, [initialData]);
  
  const calculatePrice = () => {
    if (!formData.grade || !formData.duration) return;
    
    let basePrice = 100;
    
    if (['7', '8', '9'].includes(formData.grade)) {
      basePrice = 150;
    } else if (['10', '11', '12'].includes(formData.grade)) {
      basePrice = 200;
    }
    
    const totalPrice = basePrice * formData.duration;
    setFormData(prev => ({ ...prev, price: totalPrice }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
    
    if (name === 'grade' || name === 'duration') {
      calculatePrice();
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入任务标题';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入任务描述';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = '任务描述至少20个字';
    }
    
    if (!formData.subject) {
      newErrors.subject = '请选择科目';
    }
    
    if (!formData.grade) {
      newErrors.grade = '请选择年级';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = '请输入有效的课时数量';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = '请输入有效的价格';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error('表单填写有误，请检查并修正');
    }
  };
  
  const subjectOptions = [
    { value: 'math', label: '数学' },
    { value: 'chinese', label: '语文' },
    { value: 'english', label: '英语' },
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化学' },
    { value: 'biology', label: '生物' },
    { value: 'history', label: '历史' },
    { value: 'geography', label: '地理' },
    { value: 'politics', label: '政治' },
  ];
  
  const gradeOptions = [
    { value: '1', label: '一年级' },
    { value: '2', label: '二年级' },
    { value: '3', label: '三年级' },
    { value: '4', label: '四年级' },
    { value: '5', label: '五年级' },
    { value: '6', label: '六年级' },
    { value: '7', label: '初一' },
    { value: '8', label: '初二' },
    { value: '9', label: '初三' },
    { value: '10', label: '高一' },
    { value: '11', label: '高二' },
    { value: '12', label: '高三' },
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          任务标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={cn(
            "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
            errors.title 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          )}
          placeholder="例如：数学辅导，提高孩子解题能力"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          任务描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className={cn(
            "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
            errors.description 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          )}
          placeholder="请详细描述您的需求，包括孩子目前的学习情况、需要提升的方面、期望达到的目标等..."
        />
        <div className="flex justify-between items-center">
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">{formData.description.length}/500字</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            辅导科目 <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
              errors.subject 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
          >
            <option value="">请选择科目</option>
            {subjectOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
            辅导年级 <span className="text-red-500">*</span>
          </label>
          <select
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
              errors.grade 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
          >
            <option value="">请选择年级</option>
            {gradeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.grade && (
            <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            课时数量（小时） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
              errors.duration 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder="预计需要的辅导课时数量"
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            总价格（元） <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <i class="fa-solid fa-yen-sign"></i>
            </span>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="1"
              className={cn(
                "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.price 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="辅导服务的总价格"
              readOnly
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            价格根据年级自动计算，可手动调整
          </p>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>
              <span>提交中...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <i class="fa-solid fa-paper-plane mr-2"></i>
              <span>发布教学任务</span>
            </div>
          )}
        </button>
        <p className="mt-3 text-sm text-gray-500 text-center">
          提交后将等待管理员审核，审核通过后老师可查看并接单
        </p>
      </div>
    </form>
  );
}

// 老师卡片组件
interface TeacherCardProps {
  teacher: any;
  onContact?: (teacherId: string) => void;
  onSelectAndPay?: (teacherId: string) => void;
}

function TeacherCard({ teacher, onContact, onSelectAndPay }: TeacherCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const avatarUrl = teacher.avatar || `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Teacher+avatar+${teacher.name}+professional+education+portrait&sign=3a7f8d9c0e1b2c3d4e5f6a7b8c9d0e1f`;
  
  const handleContact = () => {
    if (onContact) {
      onContact(teacher.id);
    } else {
      toast.info(`已发送联系请求给${teacher.name}`);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start">
          <div className="relative mr-4">
            <img 
              src={avatarUrl} 
              alt={teacher.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
            />
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
              {teacher.rating}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
           <div className="flex flex-col items-start">
             <h3 className="text-xl font-bold text-gray-800 truncate">{teacher.name}</h3>
             <div className="flex flex-wrap gap-2 mt-1">
               {[teacher.subject].map((subject) => (
                 <span key={subject} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                   {getSubjectName(subject)}老师
                 </span>
               ))}
             </div>
           </div>
           
           <div className="mt-1 flex flex-wrap gap-2">
             {teacher.grade.map((grade: string) => (
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
       
       <div className="mt-4">
         <p className="text-gray-600 text-sm line-clamp-2">
           {teacher.introduction}
         </p>
         
         {teacher.introduction.length > 100 && (
           <button 
             onClick={() => setShowDetails(!showDetails)}
             className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-800 transition-colors"
           >
             {showDetails ? '收起详情' : '查看更多'}
             <i className={`fa-solid ml-1 ${showDetails ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
           </button>
         )}
         
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

// 页面组件 - 首页
function Home() {
  const { isAuthenticated, userRole } = useContext(AuthContext);
  
  const logoUrl = "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=DeRunWanLian+Education+Logo+Chinese+characters+professional+education+institution+blue+color+simple+modern&sign=f2a2726d10afa9a26106ece90fbd02d9";
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8">
              <img 
                src={logoUrl} 
                alt="德润万联教育" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain mb-4 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-blue-800">德润万联教育</h1>
              <p className="text-xl text-blue-600 mt-2">连接优质教育资源，助力孩子成长</p>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 max-w-3xl">
              专业的教育资源匹配平台
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              为家长找到最合适的老师，为老师提供展示才华的平台，共同助力孩子的教育成长
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {isAuthenticated ? (
                <Link 
                  to={userRole === 'parent' ? '/parent' : 
                      userRole === 'teacher' ? '/teacher' : 
                      userRole === 'admin' ? '/admin' : '/'}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-medium shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  进入我的控制台
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-medium shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    立即注册/登录
                  </Link>
                  <Link 
                    to="/login"
                    className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-full text-lg font-medium shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    了解更多
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute top-20 -right-20 w-60 h-60 bg-yellow-200 rounded-full opacity-50 blur-3xl"></div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">平台特色</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-xl p-8 transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i class="fa-solid fa-user-graduate text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">优质师资</h3>
              <p className="text-gray-600 text-center">
                严格筛选的专业教师团队，覆盖各学科各年级，满足不同学习需求
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-8 transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i class="fa-solid fa-briefcase text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">精准匹配</h3>
              <p className="text-gray-600 text-center">
                根据孩子年级和学习需求，智能匹配最合适的老师，提高学习效率
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-8 transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i class="fa-solid fa-comments text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">便捷沟通</h3>
              <p className="text-gray-600 text-center">
                家长、老师、管理员三方即时沟通，随时掌握学习进展和教学情况
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">德润万联教育</h3>
              <p className="text-gray-400">专业的教育资源匹配平台</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-gray-400 mb-2">© 2025 德润万联教育科技有限公司</p>
              <p className="text-gray-500 text-sm">保留所有权利</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 登录页面
function Login() {
  const { setIsAuthenticated, setUserRole, setUserId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [childGrade, setChildGrade] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const initAdminUser = () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const hasAdmin = users.some((user: any) => user.role === 'admin');
      
      if (!hasAdmin) {
        const adminUser = {
          id: 'admin-1',
          phone: 'derunwanlian888',
          password: 'ljqwzk0103888',
          role: 'admin',
          name: '系统管理员',
          createdAt: new Date()
        };
        
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
      }
    };
    
    initAdminUser();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phone || !password) {
      setError('手机号和密码不能为空');
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入有效的手机号');
      return;
    }
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('两次密码输入不一致');
        return;
      }
      
      if (role === 'parent' && !childGrade) {
        setError('请选择孩子年级');
        return;
      }
    }
    
    setLoading(true);
    
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (isLogin) {
        const user = users.find((u: any) => u.phone === phone && u.password === password);
        
        if (user) {
          setIsAuthenticated(true);
          setUserRole(user.role);
          setUserId(user.id);
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          if (user.role === 'parent') {
            navigate('/parent');
          } else if (user.role === 'teacher') {
            navigate('/teacher');
          } else if (user.role === 'admin') {
            navigate('/admin');
          }
        } else {
          setError('手机号或密码不正确');
        }
      } else {
        const userExists = users.some((u: any) => u.phone === phone);
        
        if (userExists) {
          setError('该手机号已注册');
          setLoading(false);
          return;
        }
        
        const newUser = {
          id: `${role}-${Date.now()}`,
          phone,
          password,
          role,
          createdAt: new Date(),
          verificationStatus: 'unverified',
          ...(role === 'parent' && { childGrade })
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        setIsAuthenticated(true);
        setUserRole(role);
        setUserId(newUser.id);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        navigate(role === 'parent' ? '/parent/verification' : '/teacher/verification');
      }
      
      setLoading(false);
    }, 800);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? '登录账号' : '注册新账号'}
              </h2>
              <p className="text-gray-500">
                {isLogin ? '欢迎回来，请登录您的账号' : '创建一个新账号，开始使用德润万联教育平台'}
              </p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
                <i class="fa-solid fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  手机号
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <i class="fa-solid fa-phone"></i>
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="请输入手机号"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <i class="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="请输入密码（至少6位）"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    确认密码
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <i class="fa-solid fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="请再次输入密码"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
              )}
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    注册身份
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="parent"
                        checked={role === 'parent'}
                        onChange={() => setRole('parent')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">家长</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="teacher"
                        checked={role === 'teacher'}
                        onChange={() => setRole('teacher')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">老师</span>
                    </label>
                  </div>
                </div>
              )}
              
              {!isLogin && role === 'parent' && (
                <div>
                  <label htmlFor="childGrade" className="block text-sm font-medium text-gray-700 mb-1">
                    孩子年级
                  </label>
                  <select
                    id="childGrade"
                    value={childGrade}
                    onChange={(e) => setChildGrade(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="">请选择孩子年级</option>
                    <option value="1">一年级</option>
                    <option value="2">二年级</option>
                    <option value="3">三年级</option>
                    <option value="4">四年级</option>
                    <option value="5">五年级</option>
                    <option value="6">六年级</option>
                    <option value="7">初一</option>
                    <option value="8">初二</option>
                    <option value="9">初三</option>
                    <option value="10">高一</option>
                    <option value="11">高二</option>
                    <option value="12">高三</option>
                  </select>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-medium text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2",
                  loading 
                    ? "bg-blue-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                )}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                    <span>处理中...</span>
                  </div>
                ) : isLogin ? (
                  "登录"
                ) : (
                  "注册"
                )}
              </button>
              
              {!isLogin && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <i class="fa-solid fa-info-circle mr-2"></i>
                  <span>注册成功后需完成实名认证才能使用平台功能</span>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setPhone('');
                    setPassword('');
                    setConfirmPassword('');
                    setChildGrade('');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                >
                  {isLogin 
                    ? '还没有账号？立即注册' 
                    : '已有账号？返回登录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// 家长仪表盘
function ParentDashboard() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('teachers');
  
  useEffect(() => {
    if (!userId) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.id === userId);
    
    if (currentUser && currentUser.role === 'parent') {
      setUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [userId, navigate]);
  
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {user ? `${getWelcomeMessage()}，${user.name || '家长用户'}` : '家长中心'}
          </h1>
          <p className="text-gray-500 mt-1">
            欢迎使用德润万联教育平台，找到最适合您孩子的老师
          </p>
        </div>
        
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-1 flex overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('teachers');
                navigate('/parent/teachers');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'teachers' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-user-graduate mr-2"></i>
              精选老师
            </button>
            <button
              onClick={() => {
                setActiveTab('tasks');
                navigate('/parent/tasks');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'tasks' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-tasks mr-2"></i>
              我的任务
            </button>
            <button
              onClick={() => {
                setActiveTab('publish');
                navigate('/parent/tasks/new');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'publish' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-plus-circle mr-2"></i>
              发布任务
            </button>
            <button
              onClick={() => {
                setActiveTab('messages');
                navigate('/parent/messages');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'messages' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-comments mr-2"></i>
              消息中心
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                navigate('/parent/profile');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'profile' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-user mr-2"></i>
              个人中心
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// 老师列表页面
function TeacherList() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [childGrade, setChildGrade] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockTeachers = [
          {
            id: 'teacher-1',
            name: '张老师',
            subject: 'math',
            grade: ['1', '2', '3', '4', '5', '6'],
            introduction: '资深小学数学教师，10年教学经验，擅长启发式教学，让孩子爱上数学，培养逻辑思维能力。曾获市级优秀教师称号，所教学生成绩提升显著。',
            experience: '10年小学数学教学经验，曾任重点小学数学教研组组长，熟悉小学各年级数学知识点和教学大纲，擅长针对不同类型学生制定个性化教学方案。',
            rating: 5,
            price: 120,
            studentsCount: 156
          },
          {
            id: 'teacher-2',
            name: '李老师',
            subject: 'english',
            grade: ['7', '8', '9', '10', '11', '12'],
            introduction: '英语专业八级，8年初高中英语教学经验，擅长语法教学和阅读理解训练，帮助多名学生提高英语成绩，顺利考入理想大学。',
            experience: '英语专业八级，8年初高中英语教学经验，曾在知名培训机构担任英语教研组组长，熟悉中高考英语考点和命题规律，教学方法灵活多样。',
            rating: 4,
            price: 150,
            studentsCount: 128
          },
          {
            id: 'teacher-3',
            name: '王老师',
            subject: 'chinese',
            grade: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            introduction: '小学语文高级教师，15年教学经验，注重阅读与写作能力培养，善于激发学生学习兴趣，让孩子轻松学好语文。',
            experience: '小学语文高级教师，15年教学经验，曾获省级优秀教师称号，出版多本语文教学辅导书籍，擅长文言文和现代文阅读理解教学。',
            rating: 5,
            price: 130,
            studentsCount: 210
          },
          {
            id: 'teacher-4',
            name: '赵老师',
            subject: 'physics',
            grade: ['10', '11', '12'],
            introduction: '物理学科带头人，重点大学物理系毕业，12年高中物理教学经验，擅长将抽象物理概念转化为生动实例，帮助学生理解。',
            experience: '重点大学物理系毕业，12年高中物理教学经验，培养多名学生在物理竞赛中获奖，对高考物理有深入研究，教学风格严谨而不失风趣。',
            rating: 4,
            price: 180,
            studentsCount: 95
          },
          {
            id: 'teacher-5',
            name: '陈老师',
            subject: 'chemistry',
            grade: ['10', '11', '12'],
            introduction: '化学高级教师，10年高中化学教学经验，精通化学实验教学，让学生在实践中掌握化学知识，提高学习兴趣和成绩。',
            experience: '化学高级教师，10年高中化学教学经验，曾任重点高中化学备课组组长，熟悉高考化学考点和命题趋势，善于将复杂化学知识系统化、简单化。',
            rating: 5,
            price: 170,
            studentsCount: 87
          },
          {
            id: 'teacher-6',
            name: '刘老师',
            subject: 'english',
            grade: ['1', '2', '3', '4', '5', '6'],
            introduction: '少儿英语专家，擅长幼儿及小学低年级英语启蒙，采用情景教学法，让孩子在轻松愉快的氛围中学习英语，培养语感和兴趣。',
            experience: '英语教育专业毕业，8年少儿英语教学经验，持有TESOL国际英语教师资格证书，曾在国际幼儿园担任英语教师，擅长通过游戏、歌曲等方式进行英语教学。',
            rating: 4,
            price: 140,
            studentsCount: 143
          }
        ];
        
        setTeachers(mockTeachers);
        setFilteredTeachers(mockTeachers);
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find((u: any) => u.id === userId);
        
        if (currentUser && currentUser.childGrade) {
          setChildGrade(currentUser.childGrade);
          setSelectedGrades([currentUser.childGrade]);
        }
        
        setLoading(false);
      }, 800);
    };
    
    loadData();
  }, [userId]);
  
  useEffect(() => {
    let result = [...teachers];
    
    if (selectedGrades.length > 0) {
      result = result.filter(teacher => 
        teacher.grade.some((g: string) => selectedGrades.includes(g))
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(teacher => 
        teacher.name.toLowerCase().includes(term) || 
        getSubjectName(teacher.subject).toLowerCase().includes(term) ||
        teacher.introduction.toLowerCase().includes(term)
      );
    }
    
    setFilteredTeachers(result);
  }, [teachers, selectedGrades, searchTerm]);
  
  const handleContactTeacher = (teacherId: string) => {
    navigate(`/parent/tasks/new?teacherId=${teacherId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">精选老师</h2>
          <p className="text-gray-500 mt-1">
            {childGrade ? `为您推荐适合${getGradeName(childGrade)}的老师` : '找到最适合您孩子的老师'}
          </p>
        </div>
        
        <div className="w-full md:w-64 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <i class="fa-solid fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="搜索老师或科目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
      
      <GradeFilter 
        selectedGrades={selectedGrades} 
        onChange={setSelectedGrades} 
      />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mr-4"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="mt-5">
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTeachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map(teacher => (
            <TeacherCard 
              key={teacher.id} 
              teacher={teacher}
              onContact={handleContactTeacher}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <i class="fa-solid fa-search text-2xl text-blue-400"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">未找到符合条件的老师</h3>
          <p className="text-gray-500 mb-6">尝试调整筛选条件或搜索关键词</p>
          <button
            onClick={() => {
              setSelectedGrades([]);
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  );
}

// 任务发布页面
function TaskPublish() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<CreateTaskRequest>>({});
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const teacherId = searchParams.get('teacherId');
    
    if (teacherId) {
      setInitialData(prev => ({ ...prev, teacherId }));
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.id === userId);
    
    if (currentUser && currentUser.childGrade) {
      setInitialData(prev => ({ ...prev, grade: currentUser.childGrade }));
    }
  }, [userId, location.search]);
  
  const handleTaskSubmit = (taskData: CreateTaskRequest) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      try {
        const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...taskData,
          status: 'pending',
          publisherId: userId!,
          createdAt: new Date(),
          updatedAt: new Date()
        };if (taskData.teacherId) {
          existingTasks.push(newTask);
          localStorage.setItem('tasks', JSON.stringify(existingTasks));
          toast.success('任务创建成功，正在跳转到支付页面');
          navigate(`/parent/payment/${newTask.id}`);
          return;
        }
        
        existingTasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(existingTasks));
        
        toast.success('任务发布成功，等待管理员审核');navigate('/parent/tasks');
      } catch (error) {
        console.error('发布任务失败:', error);
        toast.error('发布任务失败，请稍后重试');
      } finally {
        setIsSubmitting(false);
      }
    }, 1200);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">发布教学任务</h2>
        <p className="text-gray-500 mt-1">
          填写以下信息发布教学任务需求，我们将帮助您找到合适的老师
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <TaskForm 
          initialData={initialData}
          onSubmit={handleTaskSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

// 老师仪表盘
function TeacherDashboard() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    if (!userId) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.id === userId);
    
    if (currentUser && currentUser.role === 'teacher') {
      setUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [userId, navigate]);
  
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {user ? `${getWelcomeMessage()}，${user.name || '老师用户'}` : '老师中心'}
          </h1>
          <p className="text-gray-500 mt-1">
            欢迎使用德润万联教育平台，展示您的专业能力，接收教学任务
          </p>
        </div>
        
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-1 flex overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('profile');
                navigate('/teacher/profile');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'profile' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-user mr-2"></i>
              个人资料
            </button>
            <button
              onClick={() => {
                setActiveTab('tasks');
                navigate('/teacher/tasks');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'tasks' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-briefcase mr-2"></i>
              任务中心
            </button>
            <button
              onClick={() => {
                setActiveTab('messages');
                navigate('/teacher/messages');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'messages' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-comments mr-2"></i>
              消息中心
            </button>
            <button
              onClick={() => {
                setActiveTab('earnings');
                navigate('/teacher/earnings');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'earnings' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-wallet mr-2"></i>
              收益管理
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// 管理员仪表盘
function AdminDashboard() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('statistics');
  const [stats, setStats] = useState({
    totalUsers: 0,
    parentUsers: 0,
    teacherUsers: 0,
    pendingTasks: 0,
    approvedTasks: 0,
    completedTasks: 0
  });
  
  // 生成欢迎信息
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  // 处理支付确认
  const handlePaymentConfirmation = (taskId: string) => {
    if (!userId) return;
    
    // 获取任务数据
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    // 更新任务状态
    const updatedTask = {
      ...tasks[taskIndex],
      status: 'assigned',
      paymentConfirmedAt: new Date(),
      paymentConfirmedById: userId,
      updatedAt: new Date()
    };
    
    // 创建群聊
    const chatGroupId = `chat-${Date.now()}`;
    updatedTask.chatGroupId = chatGroupId;
    
    // 保存群聊信息
    const chatGroups = JSON.parse(localStorage.getItem('chatGroups') || '{}');
    chatGroups[chatGroupId] = {
      id: chatGroupId,
      taskId: updatedTask.id,
      taskTitle: updatedTask.title,
      members: [
        { id: updatedTask.publisherId, role: 'parent' },
        { id: updatedTask.teacherId, role: 'teacher' },
        { id: userId, role: 'admin' }
      ],
      createdAt: new Date()
    };
    localStorage.setItem('chatGroups', JSON.stringify(chatGroups));
    
    // 创建欢迎消息
    const messages = JSON.parse(localStorage.getItem('messages') || '{}');
    messages[chatGroupId] = [
      {
        id: `msg-${Date.now()}`,
        senderId: userId,
        senderRole: 'admin',
        content: `欢迎加入"${updatedTask.title}"的群聊，我是客服人员。家长已完成支付，老师可以开始准备教学了。`,
        createdAt: new Date()
      }
    ];
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // 更新任务
    tasks[taskIndex] = updatedTask;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // 通知老师
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notify-${Date.now()}`,
      type: 'task_assigned',
      title: '新任务指派',
      message: `您有一个新的教学任务：${updatedTask.title}`,
      relatedTaskId: updatedTask.id,
      relatedChatId: chatGroupId,
      createdAt: new Date(),
      isRead: false,
      targetUserId: updatedTask.teacherId
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // 刷新页面
    window.location.reload();
  };
  
  // 处理支付拒绝
  const handlePaymentRejection = (taskId: string) => {
    // 获取任务数据
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    // 更新任务状态
    const updatedTask = {
      ...tasks[taskIndex],
      status: 'payment_rejected',
      updatedAt: new Date(),
      rejectionReason: '支付未确认'
    };
    
    // 更新任务
    tasks[taskIndex] = updatedTask;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // 通知家长
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notify-${Date.now()}`,
      type: 'payment_rejected',
      title: '支付未确认',
      message: `您的任务"${updatedTask.title}"支付未通过确认，请联系客服`,
      relatedTaskId: updatedTask.id,
      createdAt: new Date(),
      isRead: false,
      targetUserId: updatedTask.publisherId
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // 刷新页面
    window.location.reload();
  };
  
  // 验证管理员身份并加载数据
  useEffect(() => {
    const verifyAdminAndLoadData = () => {
      if (!userId) {
        navigate('/login');
        return;
      }
      
      // 获取用户数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: any) => u.id === userId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        navigate('/login');
        return;
      }
      
      setUser(currentUser);
      
      // 计算统计数据
      const parentUsers = users.filter((u: any) => u.role === 'parent').length;
      const teacherUsers = users.filter((u: any) => u.role === 'teacher').length;
      
      // 获取任务数据
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;
      const approvedTasks = tasks.filter((t: any) => t.status === 'approved').length;
      const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
      
      setStats({
        totalUsers: users.length,
        parentUsers,
        teacherUsers,
        pendingTasks,
        approvedTasks,
        completedTasks
      });
    };
    
    verifyAdminAndLoadData();
  }, [userId, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {user ? `${getWelcomeMessage()}，${user.name || '系统管理员'}` : '管理员中心'}
          </h1>
          <p className="text-gray-500 mt-1">
            德润万联教育平台管理后台，管理用户、任务和系统设置
          </p>
        </div>
        
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-1 flex overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('statistics');
                navigate('/admin/statistics');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'statistics' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-chart-bar mr-2"></i>
              数据统计
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                navigate('/admin/users');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'users' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-users mr-2"></i>
              用户管理
            </button>
            <button
              onClick={() => {
                setActiveTab('tasks');
                navigate('/admin/tasks');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'tasks' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-tasks mr-2"></i>
              任务审核
            </button>
            <button
              onClick={() => {
                setActiveTab('messages');
                navigate('/admin/messages');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'messages' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-comments mr-2"></i>
              消息管理
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">总用户数</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</h3>
                <p className="text-green-500 text-sm mt-2 flex items-center">
                  <i className="fa-solid fa-arrow-up mr-1"></i>
                  <span>较上月增长 12%</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">家长用户</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.parentUsers}</h3>
                <p className="text-gray-500 text-sm mt-2">占总用户 {stats.totalUsers > 0 ? Math.round((stats.parentUsers / stats.totalUsers) * 100) : 0}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user-friends text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">老师用户</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.teacherUsers}</h3>
                <p className="text-gray-500 text-sm mt-2">占总用户 {stats.totalUsers > 0 ? Math.round((stats.teacherUsers / stats.totalUsers) * 100) : 0}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user-graduate text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">待审核任务</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingTasks}</h3>
                <p className="text-yellow-500 text-sm mt-2 flex items-center">
                  <i className="fa-solid fa-exclamation-circle mr-1"></i>
                  <span>需要及时处理</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">已批准任务</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.approvedTasks}</h3>
                <p className="text-gray-500 text-sm mt-2">进行中的教学任务</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-check-circle text-teal-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">已完成任务</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.completedTasks}</h3>
                <p className="text-gray-500 text-sm mt-2">历史完成的任务</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-flag-checkered text-gray-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 min-h-[500px]">
          {activeTab !== 'statistics' && <Outlet />}
          
          {activeTab === 'statistics' && (
            <div className="text-center py-12">
              <i className="fa-solid fa-chart-pie text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-medium text-gray-500">详细统计图表功能即将上线</h3>
              <p className="text-gray-400 mt-2">敬请期待更多数据分析功能</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 主应用组件
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    localStorage.removeItem('currentUser');
  };
  
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
      setIsAuthenticated(true);
      setUserRole(currentUser.role);
      setUserId(currentUser.id);
    }
  }, []);
  
  const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: string }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && userRole !== requiredRole) {
      if (userRole === 'parent') return <Navigate to="/parent" replace />;
      if (userRole === 'teacher') return <Navigate to="/teacher" replace />;
      if (userRole === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };
  
  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        setIsAuthenticated, 
        userRole, 
        setUserRole, 
        userId,
        setUserId,
        logout 
      }}
    >
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={isAuthenticated ? 
              <Navigate to={
                userRole === 'parent' ? '/parent' : 
                userRole === 'teacher' ? '/teacher' : 
                userRole === 'admin' ? '/admin' : '/'
              } replace /> : <Login />} />
            <Route path="/parent/*" element={
              <ProtectedRoute requiredRole="parent">
                <ParentDashboard />
              </ProtectedRoute>
            }>
              <Route path="teachers" element={<TeacherList />} />
              <Route path="tasks/new" element={<TaskPublish />} />
              <Route path="payment/:taskId" element={<div>Payment Page</div>} />
              <Route path="messages" element={<div>Parent Messages</div>} />
              <Route path="verification" element={<div>Parent Verification</div>} />
              <Route index element={<Navigate to="/parent/teachers" replace />} />
            </Route>
            <Route path="/teacher/*" element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<div className="text-center text-xl py-10">页面未找到</div>} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

// 主渲染函数
function Main() {
  return (
    <StrictMode>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </StrictMode>
  );
}

// 渲染应用
createRoot(document.getElementById("root")!).render(<Main />);