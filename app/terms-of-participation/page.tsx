import LegalDoc, { H2, H3, P, UL, LI } from '@/components/LegalDoc'
import Link from 'next/link'

export const metadata = { title: 'Provider Terms of Participation — Tidal Care Network' }

const teal = '#3e6a70'

export default function TermsOfParticipationPage() {
  return (
    <LegalDoc
      title="Provider Terms of Participation"
      subtitle="Binding agreement for all providers joining the Tidal Care Network"
      effective="May 27, 2026"
    >
      <H2>1. Introduction and purpose</H2>
      <P>The Tidal Care Network (the &quot;Network&quot;) is a free, community-based referral network serving licensed clinicians, holistic and integrative providers, and allied health professionals in South Carolina. The Network is owned and administered by Gnosis Wellness Collective (&quot;Administrator&quot;).</P>
      <P>These Terms of Participation (&quot;Terms&quot;) constitute a binding agreement between the Administrator and each provider who joins the Network (&quot;Provider&quot;). By completing the onboarding process and signing the Ethics Attestation, the Provider agrees to be bound by these Terms.</P>
      <P>The Network&apos;s purpose is to help providers find and connect with one another and to share suggested-provider referral links. The Network is a directory and coordination platform — it does not provide clinical care, does not employ providers, and does not direct clinical decision-making.</P>

      <H2>2. Eligibility</H2>
      <P>To join the Network, a Provider must meet all of the following eligibility requirements:</P>
      <UL>
        <LI>Hold a current, active license, certification, or credential in their discipline recognized by the State of South Carolina or an applicable national certifying body;</LI>
        <LI>Be in good standing with their applicable licensing or certifying body, with no current active disciplinary proceedings, license suspensions, or revocations;</LI>
        <LI>Practice within the State of South Carolina, or offer telehealth services to South Carolina residents;</LI>
        <LI>Complete the Network&apos;s vetting process as described in Section 3;</LI>
        <LI>Agree to and sign the Network&apos;s Ethics Attestation as described in Section 4;</LI>
        <LI>Agree to and abide by these Terms in full.</LI>
      </UL>
      <P>The Administrator reserves the right to deny any application at their sole discretion, including where the Administrator determines that approval would not serve the best interests of the network or the communities it serves.</P>

      <H2>3. Vetting and verification</H2>
      <H3>3.1 License and credential verification</H3>
      <P>All Providers must submit a current South Carolina license number or applicable certification number at the time of application. The Administrator will verify this information against the South Carolina Department of Labor, Licensing and Regulation (SC LLR) board records, the National Provider Identifier (NPI) registry where applicable, or the relevant national certifying body.</P>
      <H3>3.2 Peer attestation</H3>
      <P>All individual and group practice Providers are required to submit the name and contact information of one professional colleague, supervisor, or reference (the &quot;Attestor&quot;) who can attest to the Provider&apos;s clinical competence and professional conduct. The following rules apply:</P>
      <UL>
        <LI>The Attestor must be a licensed, certified, or otherwise credentialed professional;</LI>
        <LI>The Attestor may not be a family member, romantic partner, or any person with a personal financial interest in the Provider&apos;s practice;</LI>
        <LI>The Attestor must complete the Network&apos;s Peer Attestation Form within 14 days of receiving the request;</LI>
        <LI>If the Attestor declines to attest or does not respond within 14 days, the Provider may submit one alternate Attestor. A declined attestation will be noted in the Provider&apos;s permanent record;</LI>
        <LI>If a second Attestor also declines, the application will be placed under administrative review.</LI>
      </UL>
      <P>Large institutional health systems (such as hospital networks accredited by The Joint Commission or CARF) may apply for a waiver of the peer attestation requirement. Waivers are granted at the sole discretion of the Administrator and must be renewed annually.</P>
      <H3>3.3 Admin review and approval</H3>
      <P>All applications are subject to final review and approval by the Administrator. The Administrator will notify the Provider of approval or denial by email within 14 business days of all vetting requirements being completed.</P>

      <H2>4. Ethics attestation</H2>
      <P>As a condition of participation, all Providers must read and sign the Network&apos;s <Link href="/ethics" style={{ color: teal }}>Ethics Attestation Agreement</Link> (a separate document). The Ethics Attestation covers the following commitments:</P>
      <UL>
        <LI>Cultural competence and humility in all aspects of practice;</LI>
        <LI>Anti-discriminatory practice with respect to race, ethnicity, gender identity, sexual orientation, religion, disability, and socioeconomic status;</LI>
        <LI>LGBTQ+ affirming and gender-affirming care;</LI>
        <LI>Trauma-informed practice;</LI>
        <LI>Ethical and transparent billing practices;</LI>
        <LI>A commitment to not engage in conversion therapy or any practice intended to change sexual orientation or gender identity;</LI>
        <LI>A commitment to ongoing professional development in equity, inclusion, and clinical best practices.</LI>
      </UL>
      <P>The Ethics Attestation must be re-signed annually at the time of profile renewal. A Provider&apos;s failure to complete the annual re-attestation will result in profile deactivation as described in Section 7.</P>

      <H2>5. Provider profile and directory listing</H2>
      <H3>5.1 Accuracy of information</H3>
      <P>Providers are responsible for ensuring that all information on their Network profile is accurate, complete, and current at all times. This includes but is not limited to: credentials, specialty areas, insurance accepted, location, availability status, and contact information.</P>
      <P>Providers must not misrepresent their qualifications, training, specialties, or affiliations in their profile.</P>
      <H3>5.2 Availability updates</H3>
      <P>Providers must keep their availability status current. The Network will send a monthly email reminder to each Provider to confirm or update their availability. Providers who do not respond to availability update requests are subject to profile deactivation as described in Section 7.</P>
      <H3>5.3 Profile content standards</H3>
      <P>All profile content must be professional, accurate, and free from marketing claims that cannot be substantiated. Providers may not make claims of specialty expertise in areas outside their training and licensure. The Administrator reserves the right to request revisions to any profile content that does not meet these standards.</P>

      <H2>6. Referrals and communication</H2>
      <H3>6.1 Nature of referrals</H3>
      <P>The Network provides a referral tool that lets a Provider generate and share a link identifying one or more suggested providers, along with an optional non-clinical note. The Network does not transmit client identifying information or protected health information between providers, and a link generated through the Network does not create a clinical relationship between the Network and any client or patient. The Provider who generates a link retains full responsibility for doing so. Any Provider who receives a client through such a link retains full clinical responsibility for the care they provide.</P>
      <H3>6.2 Confidentiality in referrals</H3>
      <P>Providers must not include Protected Health Information (PHI) as defined under the Health Insurance Portability and Accountability Act of 1996 (HIPAA) in any note or content entered into the Network&apos;s referral tool.</P>
      <P>The Network&apos;s referral tool is designed to carry only non-clinical, non-identifying information. Providers should not include client names or any client identifying information in referral notes. Any detailed clinical information must be transmitted through HIPAA-compliant means outside the Network platform.</P>
      <H3>6.3 Professional conduct in communications</H3>
      <P>All communications and content made through the Network — including referral notes, profile content, and provider-to-provider emails — must be professional, respectful, and consistent with the ethics standards set forth in Section 4. Providers may not use the Network platform to harass, solicit, or disparage other providers or clients.</P>

      <H2>7. Annual renewal and profile maintenance</H2>
      <P>Provider participation in the Network must be renewed annually. Renewal includes:</P>
      <UL>
        <LI>Re-signing the Ethics Attestation;</LI>
        <LI>Confirming or updating license and credential information;</LI>
        <LI>Reviewing and updating profile content;</LI>
        <LI>Updating availability status.</LI>
      </UL>
      <P>Providers will receive renewal reminders by email beginning 30 days before their renewal date. Profiles that are not renewed within 30 days of the renewal date will be marked inactive and hidden from the directory. Profiles not renewed within 60 days of the renewal date may be removed from the Network at the Administrator&apos;s discretion.</P>

      <H2>8. Ratings and reviews</H2>
      <H3>8.1 Provider-to-provider ratings</H3>
      <P>Following the completion of a referral, the referring Provider may be invited to rate their referral experience. Ratings are anonymous to the rated Provider. Provider-to-provider ratings assess communication, responsiveness, and professionalism.</P>
      <H3>8.2 Client reviews</H3>
      <P>Clients who were referred to a Provider through the Network may submit an anonymous review. Client reviews are moderated by the Administrator before publication. Providers may not contact, identify, or retaliate against any client who submits a review.</P>
      <H3>8.3 Disputes</H3>
      <P>Providers who believe a review is inaccurate, defamatory, or in violation of these Terms may submit a dispute to the Administrator at info@tidalcare.org. The Administrator will review the dispute and make a determination within 14 business days. The Administrator&apos;s determination is final.</P>

      <H2>9. Grounds for suspension and removal</H2>
      <P>The Administrator may suspend or remove a Provider from the Network for any of the following reasons, without limitation:</P>
      <UL>
        <LI>Misrepresentation of credentials, qualifications, or experience;</LI>
        <LI>Loss of or disciplinary action against a required license or certification;</LI>
        <LI>Violation of the Ethics Attestation commitments;</LI>
        <LI>Unprofessional conduct toward other providers, clients, or Network staff;</LI>
        <LI>Failure to maintain accurate profile information after notice and opportunity to cure;</LI>
        <LI>Failure to complete annual renewal;</LI>
        <LI>Two or more declined peer attestations;</LI>
        <LI>A pattern of ethics-related client reviews or provider complaints;</LI>
        <LI>Any conduct that the Administrator determines to be harmful to clients, to other providers, or to the integrity of the Network.</LI>
      </UL>
      <P>Prior to suspension or removal (except in cases of immediate risk of harm), the Administrator will provide written notice and an opportunity to respond within 7 business days. The Administrator&apos;s decision following that process is final.</P>
      <P>Removed providers may not reapply to the Network for a period of two years without the Administrator&apos;s express written permission.</P>

      <H2>10. Data and privacy</H2>
      <P>The collection and use of Provider information is governed by the Network&apos;s <Link href="/privacy" style={{ color: teal }}>Privacy Policy</Link>, which is incorporated into these Terms by reference. By agreeing to these Terms, the Provider consents to the collection and use of their information as described in the Privacy Policy.</P>
      <P>Provider profile information — including name, credentials, specialty, location area, and contact information — will be displayed publicly in the Network directory. Providers&apos; exact street addresses will not be displayed publicly.</P>

      <H2>11. HIPAA and Business Associate Agreement</H2>
      <P>The Network is structured to avoid handling Protected Health Information (PHI) in its core referral workflow. Providers are responsible for ensuring their use of the Network complies with all applicable HIPAA requirements.</P>
      <P>To the extent that the Network&apos;s operations bring it within the definition of a Business Associate under HIPAA, the Administrator agrees to enter into a Business Associate Agreement (BAA) with Covered Entity Providers upon request. Providers who require a BAA should contact the Administrator at info@tidalcare.org.</P>

      <H2>12. Limitation of liability</H2>
      <P>The Network is a free community platform provided as-is. The Administrator makes no warranties, express or implied, regarding the accuracy of provider directory information, the quality of care provided by any listed provider, or the outcome of any referral made through the Network.</P>
      <P>The Administrator shall not be liable for any direct, indirect, incidental, or consequential damages arising out of or related to a Provider&apos;s participation in the Network, including but not limited to clinical outcomes, referral outcomes, or disputes between providers.</P>
      <P>Providers are solely responsible for the clinical decisions they make, including referral decisions, and for compliance with all applicable laws, licensing requirements, and professional ethical standards.</P>

      <H2>13. Amendments</H2>
      <P>The Administrator may amend these Terms at any time with 30 days&apos; written notice to Providers by email. Continued participation in the Network following the effective date of any amendment constitutes acceptance of the amended Terms. If a Provider does not agree to an amendment, they may withdraw from the Network by notifying the Administrator in writing prior to the effective date.</P>

      <H2>14. Governing law</H2>
      <P>These Terms are governed by the laws of the State of South Carolina. Any disputes arising under these Terms shall be resolved in the courts of Charleston County, South Carolina.</P>

      <H2>15. Agreement</H2>
      <P>By completing the Network onboarding process and signing the Ethics Attestation, the Provider acknowledges that they have read, understood, and agree to be bound by these Terms of Participation.</P>
    </LegalDoc>
  )
}
