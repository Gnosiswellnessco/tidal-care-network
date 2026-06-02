import LegalDoc, { H2, H3, P, UL, LI } from '@/components/LegalDoc'

export const metadata = { title: 'Privacy Policy — Tidal Care Network' }

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      subtitle="How the Tidal Care Network collects, uses, and protects information"
      effective="May 27, 2026"
    >
      <H2>1. Overview</H2>
      <P>The Tidal Care Network (&quot;Network&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting the privacy of the providers who participate in the Network and the clients they serve. This Privacy Policy explains what information we collect, how we use it, who can access it, and how we protect it.</P>
      <P>This policy applies to all information collected through the Network platform, including the provider directory, onboarding forms, referral system, and all associated email communications.</P>
      <P>By participating in the Network, you agree to the collection and use of information as described in this policy.</P>

      <H2>2. Information we collect</H2>
      <H3>2.1 Provider information</H3>
      <P>When a provider applies to and participates in the Network, we collect:</P>
      <UL>
        <LI>Name and professional credentials;</LI>
        <LI>License or certification number and issuing body;</LI>
        <LI>National Provider Identifier (NPI), where applicable;</LI>
        <LI>Practice name and type;</LI>
        <LI>Specialty areas and resource categories;</LI>
        <LI>Insurance accepted and fee information;</LI>
        <LI>Practice location (zip code and area — not street address);</LI>
        <LI>Telehealth service information;</LI>
        <LI>Contact email and phone number;</LI>
        <LI>Professional biography and profile content;</LI>
        <LI>Availability status and update history;</LI>
        <LI>Peer attestation records (kept confidential — see Section 4);</LI>
        <LI>Ethics attestation records;</LI>
        <LI>Referral history (without client PHI);</LI>
        <LI>Rating and review data;</LI>
        <LI>Any communications submitted through the Network platform.</LI>
      </UL>
      <H3>2.2 Peer attestor information</H3>
      <P>When a peer attestor completes an attestation form, we collect their name, professional credentials, relationship to the applicant, professional email address, and their responses to the attestation questions.</P>
      <H3>2.3 Client information</H3>
      <P>The Network is designed to avoid collecting client Protected Health Information (PHI). Referral links generated through the Network may include an optional non-clinical note, but the Network does not collect or transmit client names or identifying health information through the referral tool. The Network does not create client accounts or client health records.</P>
      <P>If you are a client accessing the Network to submit a provider review, we collect only your review content and the referral token used to access the review form. We do not collect your name, contact information, or any identifying health information.</P>
      <H3>2.4 Automatically collected information</H3>
      <P>When you access the Network platform, we may automatically collect standard web server log information including IP address, browser type, and pages visited. This information is used solely for security and operational purposes.</P>

      <H2>3. How we use information</H2>
      <H3>3.1 Provider directory and search</H3>
      <P>Provider profile information — including name, credentials, specialty, location area, insurance, and availability — is displayed publicly in the Network directory to facilitate provider discovery and referrals.</P>
      <P>Exact street addresses are never displayed publicly. Only the neighborhood or area name associated with a provider&apos;s zip code is shown.</P>
      <H3>3.2 Vetting and compliance</H3>
      <P>License and credential information is used to verify provider eligibility. Attestation records are maintained to document compliance with Network requirements. This information is accessible only to the Network Administrator.</P>
      <H3>3.3 Referrals and communications</H3>
      <P>Referral data (the Provider who generated the link, the suggested providers, an optional non-clinical note, date, and status) is stored to support referral tracking, post-referral ratings, and network analytics. No client PHI is collected or stored as part of the referral record.</P>
      <H3>3.4 Availability and renewal reminders</H3>
      <P>Provider email addresses are used to send monthly availability reminders and annual renewal notifications. Providers may update their reminder preferences from their profile dashboard.</P>
      <H3>3.5 Network analytics</H3>
      <P>Aggregated, de-identified data about referral volume, provider categories, and geographic coverage may be used by the Administrator for network planning and reporting. This data will not be sold or shared with third parties in identifiable form.</P>

      <H2>4. Peer attestation confidentiality</H2>
      <P>Peer attestation responses are strictly confidential. The applicant provider will be informed only that an attestation was completed or declined — never the content of the attestor&apos;s responses.</P>
      <P>Attestation records are accessible only to the Network Administrator and are retained for the duration of the provider&apos;s participation in the Network plus five years thereafter.</P>
      <P>If a declined attestation is a factor in an administrative decision regarding a provider&apos;s application or membership, the provider will be informed of this fact but not of the specific content of the attestation.</P>

      <H2>5. Client review anonymity</H2>
      <P>Client reviews are submitted anonymously. The Network stores a referral token associated with each review submission for purposes of verifying that only referral-linked clients may submit reviews. This token does not contain client identifying information.</P>
      <P>In the event of a provider dispute regarding a review, the Administrator may review the referral token metadata to verify the authenticity of the submission. The client&apos;s identity will not be disclosed to the provider in any circumstance.</P>

      <H2>6. Data sharing</H2>
      <P>We do not sell provider or client information to any third party.</P>
      <P>We may share information in the following limited circumstances:</P>
      <UL>
        <LI>With service providers who assist in operating the Network platform (such as email delivery services), under contractual confidentiality obligations;</LI>
        <LI>As required by law, court order, or regulatory requirement;</LI>
        <LI>To protect the safety of clients, providers, or the public in cases of credible risk of harm;</LI>
        <LI>With your explicit written consent.</LI>
      </UL>

      <H2>7. Data security</H2>
      <P>We implement reasonable administrative, technical, and physical safeguards to protect the information we collect from unauthorized access, disclosure, alteration, or destruction. These include:</P>
      <UL>
        <LI>Encrypted data storage and transmission (TLS/HTTPS);</LI>
        <LI>Access controls limiting data access to authorized personnel;</LI>
        <LI>Secure, expiring tokens for one-click email links;</LI>
        <LI>Regular review of access logs and security practices.</LI>
      </UL>
      <P>No system is perfectly secure. In the event of a data breach affecting provider information, we will notify affected parties as required by applicable law.</P>

      <H2>8. HIPAA considerations</H2>
      <P>The Network is designed to operate without handling Protected Health Information (PHI) in its core workflow. Providers are responsible for ensuring that any information they include in referral notes or other Network communications complies with HIPAA.</P>
      <P>To the extent that the Network&apos;s operations qualify it as a Business Associate under HIPAA, the Administrator will enter into a Business Associate Agreement (BAA) with Covered Entity providers upon request. Please contact us at info@tidalcare.org to request a BAA.</P>

      <H2>9. Data retention</H2>
      <P>We retain provider profile and participation data for the duration of active Network participation. Following voluntary withdrawal or removal from the Network:</P>
      <UL>
        <LI>Public profile data is removed from the directory immediately;</LI>
        <LI>Vetting, attestation, and audit records are retained for five years;</LI>
        <LI>Referral records (without PHI) are retained for three years;</LI>
        <LI>Review and rating data is retained for the duration of the rated provider&apos;s active participation.</LI>
      </UL>

      <H2>10. Provider rights</H2>
      <P>Active providers may at any time:</P>
      <UL>
        <LI>Review and update their profile information through the Network dashboard;</LI>
        <LI>Request a copy of the information we hold about them by contacting info@tidalcare.org;</LI>
        <LI>Request correction of inaccurate information;</LI>
        <LI>Withdraw from the Network, which will result in removal of their public profile.</LI>
      </UL>
      <P>Certain records (such as attestation and audit logs) may be retained after withdrawal as described in Section 9.</P>

      <H2>11. Updates to this policy</H2>
      <P>We may update this Privacy Policy from time to time. Providers will be notified of material changes by email at least 30 days before the change takes effect. Continued participation in the Network after a policy update constitutes acceptance of the updated policy.</P>

      <H2>12. Contact</H2>
      <P>For questions, requests, or concerns regarding this Privacy Policy, contact:</P>
      <P>Gnosis Wellness Collective<br />Tidal Care Network<br />Email: info@tidalcare.org<br />Website: www.tidalcare.org</P>
    </LegalDoc>
  )
}
