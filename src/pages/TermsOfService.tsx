import { motion } from 'framer-motion';
import { Scale, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsOfService() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using CleanUp ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. We reserve the right to modify these terms at any time, and your continued use of the Platform constitutes acceptance of any changes.`
    },
    {
      title: '2. Eligibility',
      content: `You must be at least 18 years old to use CleanUp. By using the Platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms. Users between 13-17 may use the Platform with parental or guardian consent.`
    },
    {
      title: '3. Account Registration',
      content: `To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for safeguarding your account credentials and for all activities that occur under your account.`
    },
    {
      title: '4. User Conduct',
      content: `You agree to use CleanUp only for lawful purposes and in accordance with these Terms. You shall not: (a) use the Platform to organize or promote illegal activities; (b) impersonate any person or entity; (c) harass, abuse, or harm other users; (d) upload malicious content or spam; (e) attempt to gain unauthorized access to the Platform; (f) interfere with the proper functioning of the Platform.`
    },
    {
      title: '5. Cleanup Events',
      content: `When organizing or participating in cleanup events through CleanUp, you agree to: (a) follow all local laws and regulations; (b) prioritize safety for yourself and other participants; (c) accurately represent event details; (d) respect private property and obtain necessary permissions; (e) properly dispose of collected waste according to local guidelines.`
    },
    {
      title: '6. B3TR Token Rewards',
      content: `CleanUp may offer B3TR token rewards for participating in and organizing cleanup events. Rewards are subject to verification of participation through proof of work submissions. We reserve the right to modify, suspend, or terminate the rewards program at any time. Token rewards have no cash value and are subject to blockchain network terms.`
    },
    {
      title: '7. Intellectual Property',
      content: `All content on CleanUp, including text, graphics, logos, and software, is the property of CleanUp or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`
    },
    {
      title: '8. User Content',
      content: `By submitting content (photos, videos, text) to CleanUp, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content in connection with the Platform. You represent that you own or have the necessary rights to submit such content.`
    },
    {
      title: '9. Disclaimer of Warranties',
      content: `CleanUp is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the Platform will be uninterrupted, secure, or error-free. We are not responsible for any injuries, damages, or losses incurred during cleanup events.`
    },
    {
      title: '10. Limitation of Liability',
      content: `To the maximum extent permitted by law, CleanUp shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Platform. Our total liability shall not exceed the amount you paid to us, if any, in the past twelve months.`
    },
    {
      title: '11. Termination',
      content: `We may terminate or suspend your account and access to CleanUp at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.`
    },
    {
      title: '12. Governing Law',
      content: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which CleanUp operates, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved through binding arbitration.`
    },
    {
      title: '13. Contact Information',
      content: `If you have any questions about these Terms of Service, please contact us at legal@cleanup.app or through the Help Center on our Platform.`
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-24 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: December 2024</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-neutral dark:prose-invert max-w-none"
        >
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Important Notice</p>
                <p className="text-sm text-muted-foreground">
                  Please read these Terms of Service carefully before using CleanUp. By using our platform, you agree to be bound by these terms and conditions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
              >
                <h2 className="text-xl font-semibold mb-3 text-foreground">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              By using CleanUp, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
