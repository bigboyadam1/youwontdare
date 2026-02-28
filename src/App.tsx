import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Toast from './components/Toast'
import NotificationPrompt from './components/NotificationPrompt'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import PersonalBoardPage from './pages/PersonalBoardPage'
import TripBoardPage from './pages/TripBoardPage'
import CreateTripPage from './pages/CreateTripPage'
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/my-boards" element={<MyBoardsPage />} />
        <Route path="/board/:username" element={<PersonalBoardPage />} />
        <Route path="/trip/:slug" element={<TripBoardPage />} />
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/dev/share-preview" element={<SharePreviewPage />} />
      </Routes>
    </div>
  )
}

export default App
