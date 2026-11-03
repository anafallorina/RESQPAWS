
function Volunteer() {
  return (
    <div style={{ padding: "40px", background: "#FFF9F6", minHeight: "100vh" }}>
      <h1>Become a Volunteer</h1>
      <p>Be part of our animal rescue community.</p>

      <form style={{ maxWidth: "500px", display: "grid", gap: "15px", marginTop: "25px" }}>
        <input type="text" placeholder="Full name" required />
        <input type="email" placeholder="Email address" required />
        <input type="tel" placeholder="Contact number" required />
        <textarea placeholder="Why do you want to volunteer?" rows="4" />
        <button type="submit">Apply as Volunteer</button>
      </form>
    </div>
  );
}
export default Volunteer;
