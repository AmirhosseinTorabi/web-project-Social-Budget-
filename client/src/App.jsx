// src/components/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import AdminPanel from "./Components/AdminPanel";
import UserPanel from "./Components/UserPanel";
import ProposalSubmission from "./Components/ProposalSubmission";
import VotingPage from "./Components/VotingPage";
import Phase3Results from "./Components/Phase3Results";
import Login from "./Components/Login";
import Layout from "./Components/Layout";
import axios from "axios";
import GuestView from "./Components/GuestView";

const App = () => {
  const [budget, setBudget] = useState(null);
  const [role, setRole] = useState("guest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setRole(decodedToken.role);
      setIsLoggedIn(true);

      const fetchPhase = async () => {
        try {
          const response = await axios.get("http://localhost:3001/api/phase", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPhase(response.data.currentPhase);
        } catch (error) {
          console.error("Failed to fetch phase", error);
        }
      };

      fetchPhase();
    }
  });

  const handleSetBudget = (budget) => {
    setBudget(budget);
    setPhase(1);
  };

  const handleLogin = (userRole) => {
    setRole(userRole);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole("guest");
    setIsLoggedIn(false);
  };

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? (
      <Layout onLogout={handleLogout}>{children}</Layout>
    ) : (
      <Navigate to="/" />
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              {role === "admin" ? (
                phase === 0 ? (
                  <AdminPanel onSetBudget={handleSetBudget} />
                ) : phase === 1 ? (
                  <ProposalSubmission role={role} />
                ) : phase === 2 ? (
                  <VotingPage role={role} />
                ) : (
                  <Phase3Results role={role} setPhase={setPhase} />
                )
              ) : (
                <Navigate to="/" />
              )}
            </PrivateRoute>
          }
        />
        <Route
          path="/user"
          element={
            <PrivateRoute>
              {role === "user" ? (
                phase === 0 ? (
                  <UserPanel />
                ) : phase === 1 ? (
                  <ProposalSubmission role={role} />
                ) : phase === 2 ? (
                  <VotingPage role={role} />
                ) : (
                  <Phase3Results role={role} setPhase={setPhase} />
                )
              ) : (
                <Navigate to="/" />
              )}
            </PrivateRoute>
          }
        />
        <Route path="/guest" element={<GuestView />} />
        <Route
          path="/voting"
          element={
            <PrivateRoute>
              <VotingPage role={role} />
            </PrivateRoute>
          }
        />
        <Route
          path="/phase3"
          element={
            <PrivateRoute>
              <Phase3Results role={role} setPhase={setPhase} />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
