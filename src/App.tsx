import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Toast from './components/Toast'
import NotificationPrompt from './components/NotificationPrompt'
import InstallPrompt from './components/InstallPrompt'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import PersonalBoardPage from './pages/PersonalBoardPage'
import GroupBoardPage from './pages/GroupBoardPage'
import CreateGroupPage from './pages/CreateGroupPage'
import ProfilePage from './pages/ProfilePage'
import MyBoardsPage from './pages/MyBoardsPage'
import SharePreviewPage from './pages/SharePreviewPage'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-[Courier_Prime] text-[#aaa49c]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Toast />
      <NotificationPrompt />
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/my-boards" element={<MyBoardsPage />} />
        <Route path="/board/:username" element={<PersonalBoardPage />} />
        <Route path="/group/:slug" element={<GroupBoardPage />} />
        <Route path="/create-group" element={<CreateGroupPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/dev/share-preview" element={<SharePreviewPage />} />
      </Routes>
    </div>
  )
}

export default App
