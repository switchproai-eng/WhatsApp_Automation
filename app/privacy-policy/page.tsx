import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: January 27, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none">
          <p>
            At WhatsFlow, accessible from https://whatsflow.com, one of our main priorities is the privacy of our visitors. 
            This Privacy Policy document outlines the types of information that is collected and recorded by WhatsFlow and how we use it.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">General Data Protection Regulation (GDPR)</h2>
          <p>
            We are a Data Controller of your information. Our legal basis for collecting and using the personal information described 
            in this Privacy Policy depends on the Personal Information we collect and the specific context in which we collect it.
          </p>
          <p>
            We may process your Personal Information because:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>We need to perform a contract with you</li>
            <li>You have given us permission to do so</li>
            <li>The processing is in our legitimate interests and it is not overridden by your rights</li>
            <li>To comply with the law</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Information We Collect</h2>
          <p>
            We collect certain personal information about visitors and users of our Service. The information we collect depends on the 
            context of your interactions with us and the Service, the choices you make, and the products and features you use. The types 
            of personal information we collect may include, but is not limited to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>WhatsApp messages and conversations</li>
            <li>Usage data and cookies</li>
            <li>Business information (for business accounts)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">How We Use Your Information</h2>
          <p>
            We use the information we collect in various ways, including to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Provide, operate, and maintain our Service</li>
            <li>Improve, personalize, and expand our Service</li>
            <li>Understand and analyze how you use our Service</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you, either directly or through one of our partners</li>
            <li>Send you emails and notifications</li>
            <li>Find and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">WhatsApp Business API Data Handling</h2>
          <p>
            When you use our WhatsApp Business API integration, we handle your data in accordance with WhatsApp's Business Solutions Terms of Service. 
            We only access and store WhatsApp messages when you explicitly connect your WhatsApp Business account to our platform. 
            All data is encrypted in transit and at rest.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Data Retention</h2>
          <p>
            We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. 
            We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, 
            and enforce our policies.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Data Protection Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>The right to access – You have the right to request copies of your personal data</li>
            <li>The right to rectification – You have the right to request correction of inaccurate personal data</li>
            <li>The right to erasure – You have the right to request deletion of your personal data</li>
            <li>The right to restrict processing – You have the right to request restriction of processing</li>
            <li>The right to data portability – You have the right to request transfer of your data</li>
            <li>The right to object – You have the right to object to our processing</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">Security</h2>
          <p>
            We value your trust in providing us with your personal information, thus we are striving to use commercially acceptable 
            means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage 
            is 100% secure and reliable, and we cannot guarantee its absolute security.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Links to Other Sites</h2>
          <p>
            Our Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. 
            Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy 
            of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices 
            of any third-party sites or services.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Children's Information</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians 
            to observe, participate in, and/or monitor and guide their online activity. Our Service does not address anyone under 
            the age of 13. We do not knowingly collect personal identifiable information from children under 13.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. 
            We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately 
            after they are posted on this page.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Contact Us</h2>
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at switchpro.ai@gmail.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}