import { Link } from 'react-router-dom';
import './Legal.css';

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">← Back to Danny's Timers</Link>

        <h1>Terms of Service</h1>
        <p className="legal-date">Last updated: April 2025</p>

        <section>
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing or using Danny's Timers, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the application.
          </p>
        </section>

        <section>
          <h2>Description of Service</h2>
          <p>
            Danny's Timers is a free countdown timer web application. It allows users to create,
            manage, and track countdown timers. An optional Google sign-in enables syncing timers
            across devices.
          </p>
        </section>

        <section>
          <h2>Use of the Service</h2>
          <p>You agree to use the service only for lawful purposes. You must not:</p>
          <ul>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Use the service to transmit harmful, offensive, or illegal content</li>
            <li>Interfere with or disrupt the service or its servers</li>
          </ul>
        </section>

        <section>
          <h2>User Accounts</h2>
          <p>
            When you sign in with Google, you are responsible for maintaining the security of
            your Google account. You are responsible for all activity that occurs under your account.
          </p>
        </section>

        <section>
          <h2>Data and Content</h2>
          <p>
            You retain ownership of any timer data you create. By using the service, you grant
            us a limited license to store and display that data to you as part of providing the service.
          </p>
          <p>
            We reserve the right to delete inactive accounts and their associated data after an
            extended period of inactivity.
          </p>
        </section>

        <section>
          <h2>Disclaimer of Warranties</h2>
          <p>
            The service is provided "as is" and "as available" without warranties of any kind,
            either express or implied. We do not warrant that the service will be uninterrupted,
            error-free, or free of harmful components.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, we shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the service,
            including loss of data.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>
            The service uses <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a> for
            data storage and Google OAuth for authentication. Your use of these services is also
            subject to their respective terms of service and privacy policies.
          </p>
        </section>

        <section>
          <h2>Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the service after changes
            are posted constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms can be directed via the project's GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
