import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import AdminStudentDetailPage from "./pages/AdminStudentDetailPage";
import AdminExamPage from "./pages/AdminExamPage";
import AdminFeeManagementPage from "./pages/AdminFeeManagementPage";
import AdminCourseContentPage from "./pages/AdminCourseContentPage";
import CourseContentEditorPage from "./pages/CourseContentEditorPage";
import StudentExamPage from "./pages/StudentExamPage";
import ContactPage from "./pages/ContactPage";
import Spinner from "./components/Spinner";
import CoursePaymentPage from "./pages/CoursePaymentPage";
import MaterialPaymentPage from "./pages/MaterialPaymentPage";
import FeePaymentPage from "./pages/FeePaymentPage";
import InstallmentPaymentPage from "./pages/InstallmentPaymentPage";
import CoursesPage from "./pages/CoursesPage";
import CourseContentPage from "./pages/CourseContentPage";
import GalleryPage from "./pages/GalleryPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ResultsPage from "./pages/ResultsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StudentFeesPage from "./pages/StudentFeesPage";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, admin, studentOnly }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page section auth-page">
        <div className="auth-card">
          <Spinner message="Restoring session..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (studentOnly && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route
          path="/courses/:courseId/content"
          element={
            <ProtectedRoute studentOnly>
              <CourseContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/payment"
          element={
            <ProtectedRoute studentOnly>
              <CoursePaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials/:materialId/payment"
          element={
            <ProtectedRoute studentOnly>
              <MaterialPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute studentOnly>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:studentId"
          element={
            <ProtectedRoute admin>
              <AdminStudentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exams"
          element={
            <ProtectedRoute admin>
              <AdminExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute admin>
              <AdminFeeManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/course-content"
          element={
            <ProtectedRoute admin>
              <AdminCourseContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/:courseId/edit"
          element={
            <ProtectedRoute admin>
              <CourseContentEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams/:examId"
          element={
            <ProtectedRoute studentOnly>
              <StudentExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute studentOnly>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <ProtectedRoute studentOnly>
              <StudentFeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fees/:paymentId/payment"
          element={
            <ProtectedRoute studentOnly>
              <FeePaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/installments/payment"
          element={
            <ProtectedRoute studentOnly>
              <InstallmentPaymentPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
