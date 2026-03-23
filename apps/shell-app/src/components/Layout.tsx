import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container } from "react-bootstrap";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <Container className="mt-4 flex-grow-1">{children}</Container>

      <Footer />
    </div>
  );
};

export default Layout;
