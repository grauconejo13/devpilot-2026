import { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMutation, useApolloClient } from "@apollo/client";
import { LOGIN } from "../graphql/auth";
import { CURRENT_USER } from "../graphql/auth";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const navigate = useNavigate();
  const client = useApolloClient();

  const [login] = useMutation(LOGIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await login({
        variables: {
          email: form.email,
          password: form.password,
        },
      });

      console.log("Login success:", res.data);

      // 🔥 FORCE REFRESH USER STATE
      await client.refetchQueries({
        include: [CURRENT_USER],
      });

      // 🔥 WAIT A BIT FOR COOKIE SYNC
      setTimeout(() => {
        navigate("/projects");
      }, 100);

    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="bg-dark text-light p-4 shadow" style={{ width: "400px" }}>
        <h3 className="mb-4 text-center">Login</h3>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </Form.Group>

          <Button type="submit" className="w-100">
            Login
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Login;