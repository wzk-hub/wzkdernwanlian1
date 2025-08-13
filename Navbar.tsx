import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';

const Navbar = () => {
  const { isAuthenticated, userRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  // 监听滚动事件，用于导航栏样式变化
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
  
  // 生成德润万联小logo
  const logoUrl = "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=DeRunWanLian+Education+Logo+small+icon+Chinese+characters+professional+education+institution+blue+color&sign=e192a7cb5fd096a0861f59967642376f";
  
  return (
    <nav className={`w-full z-10 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logoUrl} 
              alt="德润万联教育" 
              className="h-10 w-10 rounded-md object-contain"
            />
            <span className="text-xl font-bold text-blue-800">德润万联</span>
          </Link>
          
          {/* 桌面导航 */}
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
          
          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button className="text-gray-700 focus:outline-none">
              <i class="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;