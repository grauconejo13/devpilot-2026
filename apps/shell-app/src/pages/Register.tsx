import { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { REGISTER } from "../graphql/auth";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [register, { loading }] = useMutation(REGISTER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await register({
        variables: {
          username: form.username,
          email: form.email,
          password: form.password,
        },
      });

      console.log("Register success:", res.data);

      alert("✅ Register successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      console.error("Register error:", err);

      alert(
        err?.message || "❌ Register failed (maybe user already exists?)"
      );
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card
        className="bg-dark text-light p-4 shadow"
        style={{ width: "400px" }}
      >
        <h3 className="mb-4 text-center">Register</h3>

        <Form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              placeholder="Enter username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              required
            />
          </Form.Group>

          {/* EMAIL */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </Form.Group>

          {/* PASSWORD */}
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </Form.Group>

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Register;