import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Issue from './pages/Issue'
import Verify from './pages/Verify'
import Explore from './pages/Explore'
import CredentialDetail from './pages/CredentialDetail'
import Login from './pages/Login'
import Portfolio from './pages/Portfolio'
import BulkIssue from './pages/BulkIssue'
import Pathways from './pages/Pathways'
import MultiChain from './pages/MultiChain'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/issue" element={<Issue />} />
      <Route path="/bulk-issue" element={<BulkIssue />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/credential/:id" element={<CredentialDetail />} />
      <Route path="/portfolio/:address" element={<Portfolio />} />
      <Route path="/pathways" element={<Pathways />} />
      <Route path="/multi-chain" element={<MultiChain />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
