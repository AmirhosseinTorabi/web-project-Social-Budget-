import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";

const Phase3Results = ({ role, setPhase }) => {
  const [approvedProposals, setApprovedProposals] = useState([]);
  const [nonApprovedProposals, setNonApprovedProposals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3001/api/proposals/approved",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApprovedProposals(response.data.approvedProposals);
        setNonApprovedProposals(response.data.nonApprovedProposals);
      } catch (error) {
        console.error("Failed to fetch results", error);
      }
    };
    fetchResults();
  }, []);

  const handleRestart = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/proposals/reset",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("System reset to Phase 0");
      setPhase(0);
      navigate("/admin");
    } catch (error) {
      alert("Failed to reset system");
    }
  };

  return (
    <Container>
      <h1 className="my-4">Phase 3 Results</h1>
      <Row>
        <Col>
          <h2>Approved Proposals</h2>
          {approvedProposals.length === 0 ? (
            <Alert variant="info">No approved proposals</Alert>
          ) : (
            approvedProposals.map((proposal) => (
              <Card key={proposal.id} className="mb-3">
                <Card.Body>
                  <Card.Title>{proposal.description}</Card.Title>
                  <Card.Text>
                    Cost: {proposal.cost} Euro
                    <br />
                    Proposed by: {proposal.userId}
                    <br />
                    Total Score: {proposal.totalScore}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
        <Col>
          <h2>Non-Approved Proposals</h2>
          {nonApprovedProposals.length === 0 ? (
            <Alert variant="info">No non-approved proposals</Alert>
          ) : (
            nonApprovedProposals.map((proposal) => (
              <Card key={proposal.id} className="mb-3">
                <Card.Body>
                  <Card.Title>{proposal.description}</Card.Title>
                  <Card.Text>
                    Cost: {proposal.cost} Euro
                    <br />
                    Total Score: {proposal.totalScore}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
      {role === "admin" && (
        <div className="mt-4">
          <Button variant="danger" onClick={handleRestart}>
            Restart Procedure
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Phase3Results;
