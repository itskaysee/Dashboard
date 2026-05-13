export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 640, margin: "60px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif", color: "#785b4e", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#a2998f", fontSize: "0.85rem", marginBottom: 32 }}>Last updated: May 2026</p>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>Overview</h2>
      <p>This is a personal dashboard application used solely by its owner (Casey Robinson). It is not a public service and does not collect data from third parties.</p>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>SMS Messaging</h2>
      <p>This application sends SMS notifications exclusively to the owner's personal phone number. No messages are sent to any other recipients. Message frequency is once per day (morning briefing). Message and data rates may apply.</p>
      <p>To opt out, reply <strong>STOP</strong> to any message. To opt back in, reply <strong>START</strong>.</p>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>Data Collected</h2>
      <p>The application stores personal productivity data (tasks, events, habits, goals) in a private database accessible only to the owner. No data is shared with or sold to third parties.</p>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>Third-Party Services</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li>Twilio — used to send SMS notifications to the owner's phone number</li>
        <li>Google Calendar — used to read the owner's calendar events</li>
        <li>Neon — used to store the owner's dashboard data</li>
      </ul>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 24 }}>Contact</h2>
      <p>For any questions: <a href="mailto:itskaysee@gmail.com" style={{ color: "#d68d84" }}>itskaysee@gmail.com</a></p>
    </div>
  );
}
