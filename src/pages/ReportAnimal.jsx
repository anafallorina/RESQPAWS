
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ReportAnimal() {
  return (
    <>
      <Navbar />

      <main style={{ padding: "60px 7%", minHeight: "70vh" }}>
        <h1>Report an Animal</h1>
        <p>Report a stray, injured, or abandoned animal.</p>
      </main>

      <Footer />
    </>
  );
}

export default ReportAnimal;
