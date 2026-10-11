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
import BenefitSimulatorPage from './pages/BenefitSimulatorPage';
import VerifyBenefitPage from './pages/VerifyBenefitPage';
import ImpactDashboardPage from './pages/ImpactDashboardPage';
// New Features
import YojanaParchiPage from './pages/YojanaParchiPage';
import CSCLocatorPage from './pages/CSCLocatorPage';
import DocumentCheckerPage from './pages/DocumentCheckerPage';

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
            {/* New Features */}
            <Route
              path="/yojana-parchi"
              element={
                <ProtectedRoute>
                  <YojanaParchiPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/csc-locator"
              element={
                <ProtectedRoute>
                  <CSCLocatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doc-checker"
              element={
                <ProtectedRoute>
                  <DocumentCheckerPage />
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

