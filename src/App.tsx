import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import PersonalBoardPage from './pages/PersonalBoardPage'
import TripBoardPage from './pages/TripBoardPage'
import CreateTripPage from './pages/CreateTripPage'
import ProfilePage from './pages/ProfilePage'

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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/board/:username" element={<PersonalBoardPage />} />
        <Route path="/trip/:slug" element={<TripBoardPage />} />
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
    </div>
  )
}

export default App
