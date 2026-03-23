import { Container } from "react-bootstrap";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light mt-5 py-3">
      <Container className="text-center">
        <small>DevPilot {year} • Shell App</small>
      </Container>
    </footer>
  );
};

export default Footer;
