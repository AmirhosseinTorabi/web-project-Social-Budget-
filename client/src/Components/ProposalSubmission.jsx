import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
} from "react-bootstrap";

const ProposalSubmission = ({ role }) => {
  const [budget, setBudget] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [newProposal, setNewProposal] = useState({ description: "", cost: "" });
  const [editProposal, setEditProposal] = useState(null); // New state for editing proposal
  const [errors, setErrors] = useState({}); // State for form errors
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const budgetResponse = await axios.get(
          "http://localhost:3001/api/budget",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBudget(budgetResponse.data.amount);

        const proposalsResponse = await axios.get(
          "http://localhost:3001/api/proposals/user", // Fetch user's proposals
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
  }, [proposals]);

  const validateForm = () => {
    let formErrors = {};
    if (!newProposal.description) {
      formErrors.description = "Description is required";
    }
    if (newProposal.cost <= 0) {
      formErrors.cost = "Cost should be greater than zero";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleAddProposal = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/api/proposals",
        newProposal,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProposals([...proposals, response.data]); // Use response data to ensure unique ID
      setNewProposal({ description: "", cost: "" });
      setErrors({}); // Clear errors after successful submission
    } catch (error) {
      alert(error.response.data.message || "Failed to add proposal");
    }
  };

  const handleUpdateProposal = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3001/api/proposals/${editProposal.id}`,
        editProposal,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProposals(
        proposals.map((proposal) =>
          proposal.id === editProposal.id ? response.data : proposal
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

  const handleTerminatePhase = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/phase",
        { phase: 2 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Phase 1 terminated, moving to Phase 2");
      navigate("/voting"); // Navigate to voting page
    } catch (error) {
      alert(error.response.data.message || "Failed to terminate phase");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h1 className="text-center">Proposal Submission</h1>
          <p className="text-center">Budget: {budget} Euro</p>
          <Card className="mb-3">
            <Card.Header>Proposals</Card.Header>
            <ListGroup variant="flush">
              {proposals.map((proposal) => (
                <ListGroup.Item key={proposal.id}>
                  <Row>
                    <Col>
                      {proposal.description} - {proposal.cost} Euro
                    </Col>
                    <Col className="text-end">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => setEditProposal(proposal)}
                        className="me-2"
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

          <Card>
            <Card.Header>Add New Proposal</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProposal.description}
                    onChange={(e) =>
                      setNewProposal({
                        ...newProposal,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description"
                  />
                  {errors.description && (
                    <Form.Text className="text-danger">
                      {errors.description}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCost">
                  <Form.Label>Cost</Form.Label>
                  <Form.Control
                    type="number"
                    value={newProposal.cost}
                    onChange={(e) =>
                      setNewProposal({ ...newProposal, cost: e.target.value })
                    }
                    placeholder="Cost"
                  />
                  {errors.cost && (
                    <Form.Text className="text-danger">{errors.cost}</Form.Text>
                  )}
                </Form.Group>
                <Button variant="primary" onClick={handleAddProposal}>
                  Add Proposal
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {editProposal && (
            <Card className="mt-3">
              <Card.Header>Edit Proposal</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="formEditDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      value={editProposal.description}
                      onChange={(e) =>
                        setEditProposal({
                          ...editProposal,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEditCost">
                    <Form.Label>Cost</Form.Label>
                    <Form.Control
                      type="number"
                      value={editProposal.cost}
                      onChange={(e) =>
                        setEditProposal({
                          ...editProposal,
                          cost: e.target.value,
                        })
                      }
                      placeholder="Cost"
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={handleUpdateProposal}>
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    className="ms-2"
                    onClick={() => setEditProposal(null)}
                  >
                    Cancel
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {role === "admin" && (
            <Button
              variant="danger"
              className="mt-3"
              onClick={handleTerminatePhase}
            >
              Terminate Phase 1
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProposalSubmission;
