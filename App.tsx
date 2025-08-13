import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ParentDashboard from "@/pages/ParentDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import TeacherList from "@/pages/parent/TeacherList";
import TaskPublish from "@/pages/parent/TaskPublish";
import Payment from "@/pages/parent/Payment";
import ParentMessages from "@/pages/parent/Messages";
import ParentVerification from "@/pages/parent/Verification";
import TeacherMessages from "@/pages/teacher/Messages";
import TeacherProfile from "@/pages/teacher/Profile";
import TeacherVerification from "@/pages/teacher/Verification";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';
import Navbar from "@/components/Navbar";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); // 家长/老师/管理员
  const [userId, setUserId] = useState<string | null>(null);

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    localStorage.removeItem('currentUser');
  };

  // 保护路由组件
  const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: string }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && userRole !== requiredRole) {
      // 根据用户角色重定向到相应的仪表盘
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
                <Route path="payment/:taskId" element={<Payment />} />
                  <Route path="messages" element={<ParentMessages />} />
                  <Route path="verification" element={<ParentVerification />} />
                  <Route index element={<Navigate to="/parent/teachers" replace />} />
             </Route>
             <Route path="/teacher/*" element={
               <ProtectedRoute requiredRole="teacher">
                 <TeacherDashboard />
               </ProtectedRoute>
             }>
                 <Route path="profile" element={<TeacherProfile />} />
                 <Route path="verification" element={<TeacherVerification />} />
                 <Route path="messages" element={<TeacherMessages />} />
               <Route index element={<Navigate to="/teacher/profile" replace />} />
             </Route>
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
