export default function TermsAndConditions() {
  return (
    <div style={{ maxWidth: 640, margin: "60px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif", color: "#785b4e", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>Terms and Conditions</h1>
      <p style={{ color: "#a2998f", fontSize: "0.85rem", marginBottom: 32 }}>Last updated: May 2026</p>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>Overview</h2>
      <p>This is a private personal dashboard application used solely by its owner. It is not available to the public and does not offer services to third parties.</p>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>SMS Terms</h2>
      <p>By using this application, the owner consents to receive SMS notifications on their personal phone number. Messages are sent once per day and may include daily events, tasks, and goal reminders.</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Message frequency: up to 1 message per day</li>
        <li>Message and data rates may apply</li>
        <li>Reply <strong>STOP</strong> to unsubscribe at any time</li>
        <li>Reply <strong>HELP</strong> for help</li>
        <li>Reply <strong>START</strong> to resubscribe</li>
      </ul>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>Use of Service</h2>
      <p>This application is for personal productivity use only. The owner is responsible for all data entered into the dashboard. The application is provided as-is with no guarantees of uptime or availability.</p>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>Contact</h2>
      <p>For any questions: <a href="mailto:itskaysee@gmail.com" style={{ color: "#d68d84" }}>itskaysee@gmail.com</a></p>
    </div>
  );
}
