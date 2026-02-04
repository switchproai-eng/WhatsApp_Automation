import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <p className="text-muted-foreground">Last updated: January 27, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none">
          <p>
            Welcome to WhatsFlow! These terms and conditions outline the rules and regulations for the use of WhatsFlow's Website, 
            located at https://whatsflow.com.
          </p>
          
          <p className="mt-4">
            By accessing this website we assume you accept these terms and conditions. Do not continue to use WhatsFlow if you do not 
            agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Eligibility</h2>
          <p>
            By using our Service, you represent and warrant that: (i) you have the legal capacity to enter into these Terms; 
            (ii) you are not a minor in the jurisdiction in which you reside; and (iii) your registration on and use of the 
            Service is in compliance with all applicable laws and regulations.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">License to Use the Service</h2>
          <p>
            Subject to these Terms, WhatsFlow grants you a non-exclusive, non-transferable, revocable license to use the Service 
            solely for your personal, non-commercial purposes.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. You are responsible for 
            maintaining the security of your account and for all activities that occur under your account. You agree to notify 
            us immediately of any unauthorized access or use of your account.
          </p>
          <p className="mt-2">
            You may not use as a username the name of another person or entity or that is not lawfully available for use, a name 
            or trademark that is subject to any rights of another person or entity other than you, without appropriate authorization.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Acceptable Use</h2>
          <p>
            You agree not to use the Service to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Violate any local, state, national, or international law</li>
            <li>Engage in any illegal activity, including but not limited to money laundering or terrorist financing</li>
            <li>Harass, abuse, or harm another person</li>
            <li>Impersonate another person or entity</li>
            <li>Send spam or unsolicited commercial communications</li>
            <li>Transmit any viruses, worms, defects, trojans, or other items of a destructive nature</li>
            <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
            <li>Attempt to gain unauthorized access to the Service or other accounts</li>
            <li>Reverse engineer, decompile, disassemble, or create derivative works from the Service</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">WhatsApp Business API Compliance</h2>
          <p>
            By using our WhatsApp Business API integration, you acknowledge and agree to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Comply with WhatsApp's Business Solutions Terms of Service</li>
            <li>Obtain proper consent before sending messages to users</li>
            <li>Respect user privacy and data protection rights</li>
            <li>Not send spam or unsolicited messages</li>
            <li>Follow all applicable messaging policies and guidelines</li>
            <li>Handle user data securely and in accordance with privacy laws</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of 
            WhatsFlow and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States 
            and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without 
            the prior written consent of WhatsFlow.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Third-Party Links</h2>
          <p>
            Our Service may contain links to third-party websites or services that are not owned or controlled by WhatsFlow.
          </p>
          <p className="mt-2">
            WhatsFlow has no control over and assumes no responsibility for the content, privacy policies, or practices of any 
            third-party websites or services. You further acknowledge and agree that WhatsFlow shall not be responsible or liable, 
            directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or 
            reliance on any such content, goods or services available on or through any such websites or services.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
            under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of 
            these Terms.
          </p>
          <p className="mt-2">
            If you wish to terminate your account, you may simply discontinue using the Service. All provisions of these Terms which 
            by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, 
            warranty disclaimers, indemnity and limitations of liability.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its 
            conflict of law provisions.
          </p>
          <p className="mt-2">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any 
            provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms 
            will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and 
            replace any prior agreements we might have had between us regarding the Service.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Changes to These Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material 
            we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will 
            be determined at our sole discretion.
          </p>
          <p className="mt-2">
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. 
            If you do not agree to the new terms, you are no longer authorized to use the Service.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Limitation of Liability</h2>
          <p>
            In no event shall WhatsFlow, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
            indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, 
            use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
          <p className="mt-2">
            We do not make any warranty that the Service will meet your requirements, achieve any intended results, or be compatible 
            with any specific hardware or software. In no event shall WhatsFlow or any provider of third-party services guarantee 
            the accuracy or completeness of any information found through the Service.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at switchpro.ai@gmail.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}