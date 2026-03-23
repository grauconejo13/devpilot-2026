import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const AppNavbar = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          DevPilot
        </Navbar.Brand>

        <Nav className="me-auto">
          {user && (
            <>
              <Nav.Link as={Link} to="/projects" className="text-light">
                Projects
              </Nav.Link>
              <Nav.Link as={Link} to="/ai-review">
                AI Review
              </Nav.Link>
            </>
          )}
        </Nav>

        <div className="d-flex">
          {!user && (
            <>
              <Nav.Link as={Link} to="/login" className="text-light">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="text-light">
                Register
              </Nav.Link>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
