import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";

const GuestView = () => {
  const [phase, setPhase] = useState(0);
  const [approvedProposals, setApprovedProposals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhase = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/phase");
        console.log(response.data.currentPhase);
        setPhase(response.data.currentPhase);
      } catch (error) {
        console.error("Failed to fetch phase", error);
      }
    };

    fetchPhase();
  }, []);

  useEffect(() => {
    if (phase === 3) {
      const fetchApprovedProposals = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3001/api/proposals/approved"
          );
          setApprovedProposals(response.data.approvedProposals);
        } catch (error) {
          console.error("Failed to fetch approved proposals", error);
        }
      };

      fetchApprovedProposals();
    }
  }, [phase]);

  if (phase !== 3) {
    return (
      <Container className="mt-5">
        <Alert variant="info">The proposal definition phase is ongoing.</Alert>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1>Approved Proposals</h1>
      {approvedProposals.length === 0 ? (
        <Alert variant="warning">No approved proposals</Alert>
      ) : (
        <Row>
          {approvedProposals.map((proposal) => (
            <Col key={proposal.id} sm={12} md={6} lg={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{proposal.description}</Card.Title>
                  <Card.Text>
                    <strong>Cost:</strong> {proposal.cost} Euro
                  </Card.Text>
                  <Card.Text>
                    <strong>Total Score:</strong> {proposal.totalScore}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <Button variant="secondary" onClick={() => navigate("/")}>
        Back
      </Button>
    </Container>
  );
};

export default GuestView;
