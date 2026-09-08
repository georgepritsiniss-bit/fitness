import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MainLayout } from './layouts/MainLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { WorkoutDetailPage } from './pages/WorkoutDetailPage'
import { ExercisesPage } from './pages/ExercisesPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage'
import { AdminWorkoutsPage } from './pages/admin/AdminWorkoutsPage'
import { AdminExercisesPage } from './pages/admin/AdminExercisesPage'
import { AdminAssignPage } from './pages/admin/AdminAssignPage'
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="workouts" element={<WorkoutsPage />} />
            <Route path="workouts/:id" element={<WorkoutDetailPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route
              path="favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="workouts" element={<AdminWorkoutsPage />} />
            <Route path="exercises" element={<AdminExercisesPage />} />
            <Route path="assign" element={<AdminAssignPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
