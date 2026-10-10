import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import RecommendedPage from './pages/RecommendedPage';
import JobsExamsPage from './pages/JobsExamsPage';
import SavedSchemesPage from './pages/SavedSchemesPage';
import ProfilePage from './pages/ProfilePage';

// BenefitOS Intelligence Pages
import BenefitGapPage from './pages/BenefitGapPage';
import FamilyBenefitPage from './pages/FamilyBenefitPage';
import BenefitPathwayPage from './pages/BenefitPathwayPage';
import ActionPlanPage from './pages/ActionPlanPage';
import BenefitSimulatorPage from './pages/BenefitSimulatorPage';
import VerifyBenefitPage from './pages/VerifyBenefitPage';
import ImpactDashboardPage from './pages/ImpactDashboardPage';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <SidebarProvider>
            <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gap" 
              element={
                <ProtectedRoute>
                  <BenefitGapPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/family" 
              element={
                <ProtectedRoute>
                  <FamilyBenefitPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pathways" 
              element={
                <ProtectedRoute>
                  <BenefitPathwayPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/action-plan" 
              element={
                <ProtectedRoute>
                  <ActionPlanPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/simulator" 
              element={
                <ProtectedRoute>
                  <BenefitSimulatorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verify" 
              element={
                <ProtectedRoute>
                  <VerifyBenefitPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/impact" 
              element={
                <ProtectedRoute>
                  <ImpactDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recommended" 
              element={
                <ProtectedRoute>
                  <RecommendedPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs-exams" 
              element={
                <ProtectedRoute>
                  <JobsExamsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/saved" 
              element={
                <ProtectedRoute>
                  <SavedSchemesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Global Multilingual Voice & Text AI Chatbot Assistant */}
          <Chatbot />
          </SidebarProvider>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;

