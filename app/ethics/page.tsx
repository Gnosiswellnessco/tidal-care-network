import LegalDoc, { H2, H3, P, UL, LI } from '@/components/LegalDoc'

export const metadata = { title: 'Ethics Attestation Agreement — Tidal Care Network' }

export default function EthicsPage() {
  return (
    <LegalDoc
      title="Ethics Attestation Agreement"
      subtitle="Required for all providers — renewed annually"
      effective="May 27, 2026"
    >
      <H2>Purpose of this agreement</H2>
      <P>The Tidal Care Network is committed to ensuring that all providers in its network deliver care that is ethical, inclusive, and equitable. This Ethics Attestation Agreement sets forth the standards that every Provider must actively uphold as a condition of participation in the Network.</P>
      <P>This agreement is not a formality. Each condition below reflects a meaningful commitment to the clients and communities served by this network. Providers are asked to read each statement carefully and attest honestly.</P>

      <H2>Ethics conditions</H2>

      <H3>Condition 1 — Cultural competence and humility</H3>
      <P>I actively practice culturally responsive care. I recognize that my clients&apos; cultural backgrounds, identities, and lived experiences directly shape their health, their relationship to care, and what &quot;wellness&quot; means to them. I commit to:</P>
      <UL>
        <LI>Pursuing ongoing education in cultural humility and competence;</LI>
        <LI>Examining and working to address my own biases and assumptions;</LI>
        <LI>Adapting my practice to meet the cultural needs of the clients I serve;</LI>
        <LI>Seeking consultation or referral when a client&apos;s cultural context is outside my area of competence.</LI>
      </UL>

      <H3>Condition 2 — Anti-discriminatory practice</H3>
      <P>I do not discriminate against any client or potential client on the basis of race, ethnicity, national origin, color, sex, gender identity or expression, sexual orientation, age, disability, socioeconomic status, religion, immigration status, or any other characteristic protected by law or professional ethics codes.</P>
      <P>I commit to providing equitable, respectful care to all clients, and to actively working to reduce barriers to care in my practice.</P>

      <H3>Condition 3 — LGBTQ+ and gender-affirming care</H3>
      <P>I provide affirming, respectful care to LGBTQ+ individuals, including lesbian, gay, bisexual, transgender, nonbinary, queer, intersex, and asexual individuals and their families. I commit to:</P>
      <UL>
        <LI>Using clients&apos; correct names and pronouns without exception;</LI>
        <LI>Understanding the specific health and mental health needs of LGBTQ+ communities;</LI>
        <LI>Creating a welcoming environment free from harmful assumptions;</LI>
        <LI>Referring to affirming specialists when a client&apos;s needs are outside my scope.</LI>
      </UL>

      <H3>Condition 4 — Trauma-informed practice</H3>
      <P>I recognize the widespread impact of trauma on health and behavior. I commit to practicing in a way that:</P>
      <UL>
        <LI>Prioritizes physical, psychological, and emotional safety for clients;</LI>
        <LI>Acknowledges the signs and symptoms of trauma across all presentations;</LI>
        <LI>Integrates knowledge about trauma into all aspects of my practice;</LI>
        <LI>Avoids re-traumatization through careful attention to language, environment, and process.</LI>
      </UL>

      <H3>Condition 5 — Ethical and transparent billing</H3>
      <P>I commit to honest, transparent communication about fees, insurance coverage, and financial policies. Specifically:</P>
      <UL>
        <LI>I clearly communicate my fees before services begin;</LI>
        <LI>I do not engage in fraudulent billing practices;</LI>
        <LI>I am transparent about sliding scale availability, if offered;</LI>
        <LI>I provide superbills or other documentation as required and agreed upon;</LI>
        <LI>I do not engage in fee-splitting or referral kickback arrangements.</LI>
      </UL>

      <H3>Condition 6 — No conversion practices</H3>
      <P>I do not engage in conversion therapy or any practice, intervention, or treatment that seeks to change, suppress, or eliminate a person&apos;s sexual orientation, gender identity, or gender expression. This prohibition applies regardless of the client&apos;s age, the request of the client or their family, or any religious or cultural justification.</P>
      <P>This condition is non-negotiable and applies to all forms of such practice, whether formal or informal, explicit or implicit.</P>

      <H3>Condition 7 — Continuing education and professional development</H3>
      <P>I commit to ongoing professional development that includes attention to equity, inclusion, cultural competence, and clinical best practices. I will:</P>
      <UL>
        <LI>Fulfill the continuing education requirements of my licensing or certifying body;</LI>
        <LI>Pursue training in culturally responsive and equity-centered care;</LI>
        <LI>Stay informed about evolving standards of practice in my discipline;</LI>
        <LI>Seek supervision or consultation when confronted with practice situations outside my competence.</LI>
      </UL>

      <H3>Condition 8 — Accurate representation of my services</H3>
      <P>The specialties, approaches, and designations I select on my Network profile — such as &quot;trauma-informed&quot; or other modality- or identity-specific labels — reflect actual training and current practice. I commit to:</P>
      <UL>
        <LI>Selecting only specialties and approaches I am genuinely trained and qualified to provide;</LI>
        <LI>Affirming, when prompted, that I have completed the relevant training before claiming a specialized designation;</LI>
        <LI>Removing any designation that no longer reflects my training or practice;</LI>
        <LI>Understanding that these selections are displayed to the public as provider-reported.</LI>
      </UL>

      <H2>Scope and enforcement</H2>
      <P>This attestation covers my conduct in all professional activities, including direct client care, referral practices, professional communications, and conduct within the Tidal Care Network platform.</P>
      <P>A violation of any condition in this agreement may result in suspension or removal from the Network, as described in the Provider Terms of Participation. The Administrator retains sole discretion in determining whether a violation has occurred and what action is appropriate.</P>
      <P>This agreement does not replace or supersede any obligations I hold under applicable law, licensing board rules, or professional ethics codes. It supplements those obligations.</P>

      <H2>Annual renewal</H2>
      <P>This attestation must be renewed annually. I understand that my profile will be deactivated if I do not complete the annual renewal within the designated renewal period.</P>

      <H2>Attestation</H2>
      <P>By agreeing to this document during onboarding, I affirm that:</P>
      <UL>
        <LI>I have read and understood each of the conditions set forth in this agreement;</LI>
        <LI>I agree to abide by each condition as an active and ongoing commitment — not merely at the time of signing;</LI>
        <LI>I acknowledge that my participation in the Tidal Care Network is contingent on upholding these commitments;</LI>
        <LI>I understand that a violation of this agreement may result in my removal from the Network;</LI>
        <LI>I will re-attest to this agreement annually as a condition of continued participation.</LI>
      </UL>
    </LegalDoc>
  )
}
