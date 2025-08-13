import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CreateTaskRequest } from '@/models/Task';
import { toast } from 'sonner';

// 任务表单组件
interface TaskFormProps {
  initialData?: Partial<CreateTaskRequest>;
  onSubmit: (data: CreateTaskRequest) => void;
  isSubmitting: boolean;
}

// 科目选项
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

// 年级选项
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

export default function TaskForm({ initialData, onSubmit, isSubmitting }: TaskFormProps) {
  // 表单状态
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    subject: initialData?.subject || '',
    grade: initialData?.grade || '',
    duration: initialData?.duration || 10,
    price: initialData?.price || 0,
    teacherId: initialData?.teacherId
  });
  
  // 表单验证状态
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 当初始数据变化时更新表单
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // 保持已有值，如果初始数据中没有提供
        title: initialData.title || prev.title,
        description: initialData.description || prev.description,
        subject: initialData.subject || prev.subject,
        grade: initialData.grade || prev.grade,
        duration: initialData.duration || prev.duration,
        price: initialData.price || prev.price,
      }));
    }
    
    // 如果提供了年级，尝试自动计算价格
    if (initialData?.grade) {
      calculatePrice();
    }
  }, [initialData]);
  
  // 根据年级和课时计算价格
  const calculatePrice = () => {
    if (!formData.grade || !formData.duration) return;
    
    // 根据年级设置不同基础价格
    let basePrice = 100; // 默认价格
    
    // 初中（7-9年级）加价
    if (['7', '8', '9'].includes(formData.grade)) {
      basePrice = 150;
    } 
    // 高中（10-12年级）加价更多
    else if (['10', '11', '12'].includes(formData.grade)) {
      basePrice = 200;
    }
    
    // 计算总价
    const totalPrice = basePrice * formData.duration;
    setFormData(prev => ({ ...prev, price: totalPrice }));
  };
  
  // 处理表单字段变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
    
    // 如果修改了年级或课时，重新计算价格
    if (name === 'grade' || name === 'duration') {
      calculatePrice();
    }
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 表单验证
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
  
  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error('表单填写有误，请检查并修正');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 任务标题 */}
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
      
      {/* 任务描述 */}
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
      
      {/* 科目和年级 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 科目 */}
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
        
        {/* 年级 */}
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
      
      {/* 课时和价格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 课时数量 */}
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
        
        {/* 总价格 */}
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
      
      {/* 提交按钮 */}
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