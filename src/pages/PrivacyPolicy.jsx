import { Link } from 'react-router-dom';
import './Legal.css';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">← Back to Danny's Timers</Link>

        <h1>Privacy Policy</h1>
        <p className="legal-date">Last updated: April 2025</p>

        <section>
          <h2>Overview</h2>
          <p>
            Danny's Timers ("we", "us", or "our") is a free countdown timer application.
            We take your privacy seriously and collect only what is necessary to provide the service.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <h3>When you use the app as a guest</h3>
          <p>
            No personal information is collected. Timer data is stored exclusively in your
            browser's <code>localStorage</code> and never leaves your device.
          </p>
          <h3>When you sign in with Google</h3>
          <p>We receive the following from Google OAuth:</p>
          <ul>
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your Google profile picture URL</li>
          </ul>
          <p>
            This information is stored securely via <strong>Supabase</strong> (our backend provider)
            and is used solely to identify your account and sync your timers across devices.
          </p>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To authenticate you and associate your timers with your account</li>
            <li>To sync your timer data across your devices</li>
          </ul>
          <p>We do not sell, rent, or share your personal information with any third parties.</p>
        </section>

        <section>
          <h2>Data Storage</h2>
          <p>
            Your data is stored using <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>,
            a cloud database platform. Supabase stores data on servers provided by Amazon Web Services (AWS).
            You can review Supabase's privacy policy at{' '}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use browser <code>localStorage</code> to store your timers and theme preference.
            Supabase may set session cookies to keep you logged in. We do not use advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>You may at any time:</p>
          <ul>
            <li>Delete all your timers using the "Clear All Timers" button in Settings</li>
            <li>Request deletion of your account and associated data by contacting us</li>
          </ul>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            This application is not directed at children under 13. We do not knowingly collect
            personal information from children under 13.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy occasionally. Changes will be reflected by updating the
            "Last updated" date above.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            If you have any questions about this privacy policy, please open an issue on the
            project's GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
