import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";

const AdminPanel = ({ onSetBudget }) => {
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (budget <= 0) {
      setMessage("The budget should be greater than zero");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No token found. Please log in.");
        return;
      }

      const response = await axios.post(
        "http://localhost:3001/api/budget",
        { budget: parseFloat(budget) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSetBudget(response.data.amount);
      setMessage("Budget set successfully");
      navigate("/admin"); // Navigate to proposal submission page for admin
    } catch (error) {
      console.error("Failed to set budget", error);
      setMessage("Failed to set budget");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1 className="text-center">Admin Panel</h1>
          {message && <Alert variant="info">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBudget">
              <Form.Label>Set Budget</Form.Label>
              <Form.Control
                type="number"
                value={budget}
                onChange={handleBudgetChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Set Budget
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;
