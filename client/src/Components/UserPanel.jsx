import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert } from "react-bootstrap";

const UserPanel = () => {
  const [budget, setBudget] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [newProposal, setNewProposal] = useState({ description: "", cost: "" });
  const [editProposal, setEditProposal] = useState(null); // New state for editing proposal
  const [phase, setPhase] = useState(0); // State for current phase

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch the current phase
        const phaseResponse = await axios.get(
          "http://localhost:3001/api/phase",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPhase(phaseResponse.data.currentPhase);

        // Fetch the budget
        const budgetResponse = await axios.get(
          "http://localhost:3001/api/budget",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBudget(budgetResponse.data.amount);

        // Fetch the proposals
        const proposalsResponse = await axios.get(
          "http://localhost:3001/api/proposals",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProposals(proposalsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const handleAddProposal = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/api/proposals",
        newProposal,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProposals([...proposals, response.data]);
      setNewProposal({ description: "", cost: "" });
    } catch (error) {
      alert(error.response.data.message || "Failed to add proposal");
    }
  };

  const handleUpdateProposal = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/proposals/${editProposal.id}`,
        editProposal,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProposals(
        proposals.map((proposal) =>
          proposal.id === editProposal.id
            ? { ...proposal, ...editProposal }
            : proposal
        )
      );
      setEditProposal(null);
    } catch (error) {
      alert(error.response.data.message || "Failed to update proposal");
    }
  };

  const handleDeleteProposal = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/api/proposals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProposals(proposals.filter((proposal) => proposal.id !== id));
    } catch (error) {
      alert(error.response.data.message || "Failed to delete proposal");
    }
  };

  if (phase === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">The proposal phase is still closed.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h1>User Panel</h1>
          <p>Budget: {budget} Euro</p>
          <Card className="mb-3">
            <Card.Header>Proposals</Card.Header>
            <ListGroup variant="flush">
              {proposals.map((proposal, index) => (
                <ListGroup.Item key={proposal.id || index}>
                  <Row>
                    <Col>{proposal.description} - {proposal.cost} Euro</Col>
                    <Col className="text-end">
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => setEditProposal(proposal)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteProposal(proposal.id)}
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
          <Card className="mb-3">
            <Card.Header>Add Proposal</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProposal.description}
                    onChange={(e) =>
                      setNewProposal({ ...newProposal, description: e.target.value })
                    }
                    placeholder="Enter description"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCost">
                  <Form.Label>Cost</Form.Label>
                  <Form.Control
                    type="number"
                    value={newProposal.cost}
                    onChange={(e) =>
                      setNewProposal({ ...newProposal, cost: e.target.value })
                    }
                    placeholder="Enter cost"
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleAddProposal}>
                  Add Proposal
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {editProposal && (
            <Card className="mb-3">
              <Card.Header>Edit Proposal</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="formEditDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      value={editProposal.description}
                      onChange={(e) =>
                        setEditProposal({ ...editProposal, description: e.target.value })
                      }
                      placeholder="Enter description"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEditCost">
                    <Form.Label>Cost</Form.Label>
                    <Form.Control
                      type="number"
                      value={editProposal.cost}
                      onChange={(e) =>
                        setEditProposal({ ...editProposal, cost: e.target.value })
                      }
                      placeholder="Enter cost"
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={handleUpdateProposal}>
                    Save
                  </Button>
                  <Button variant="secondary" onClick={() => setEditProposal(null)}>
                    Cancel
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default UserPanel;
