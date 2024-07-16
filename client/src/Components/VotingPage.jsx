import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  ListGroup,
} from "react-bootstrap";

const VotingPage = ({ role }) => {
  const [budget, setBudget] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserId(decodedToken.userId);

        const proposalsResponse = await axios.get(
          "http://localhost:3001/api/proposals",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProposals(proposalsResponse.data);

        const preferencesResponse = await axios.get(
          "http://localhost:3001/api/preferences",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const preferencesData = preferencesResponse.data.reduce((acc, pref) => {
          acc[pref.proposalId] = pref.score;
          return acc;
        }, {});
        setPreferences(preferencesData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const handleVote = async (proposalId, score) => {
    if (score < 1 || score > 3) {
      setErrors({ ...errors, [proposalId]: "Score must be between 1 and 3" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/preferences",
        { proposalId, score },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPreferences({ ...preferences, [proposalId]: score });
      setErrors({ ...errors, [proposalId]: null });
    } catch (error) {
      alert(error.response.data.message || "Failed to submit preference");
    }
  };

  const handleRevoke = async (proposalId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:3001/api/preferences", {
        headers: { Authorization: `Bearer ${token}` },
        data: { proposalId },
      });
      const updatedPreferences = { ...preferences };
      delete updatedPreferences[proposalId];
      setPreferences(updatedPreferences);
    } catch (error) {
      alert(error.response.data.message || "Failed to revoke preference");
    }
  };

  const handleTerminatePhase = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/phase",
        { phase: 3 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/phase3");
      alert("Voting phase terminated, moving to Phase 3");
    } catch (error) {
      alert(error.response.data.message || "Failed to terminate phase");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h1 className="text-center">Voting Page</h1>
          <Card className="mb-3">
            <Card.Header>Proposals</Card.Header>
            <ListGroup variant="flush">
              {proposals.map((proposal) => (
                <ListGroup.Item key={proposal.id}>
                  <Row>
                    <Col>{proposal.description} - {proposal.cost} Euro</Col>
                    <Col className="text-end">
                      <Form.Control
                        as="select"
                        value={preferences[proposal.id] || ""}
                        onChange={(e) => handleVote(proposal.id, Number(e.target.value))}
                        disabled={proposal.userId === userId}
                        className="d-inline-block w-auto me-2"
                      >
                        <option value="">Select a score</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </Form.Control>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRevoke(proposal.id)}
                        disabled={proposal.userId === userId}
                      >
                        Revoke
                      </Button>
                      {errors[proposal.id] && (
                        <Form.Text className="text-danger">
                          {errors[proposal.id]}
                        </Form.Text>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {role === "admin" && (
            <Button variant="danger" className="mt-3" onClick={handleTerminatePhase}>
              Terminate Voting Phase
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default VotingPage;
