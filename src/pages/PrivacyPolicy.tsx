import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicy() {
  const highlights = [
    { icon: Lock, title: 'Data Encryption', description: 'All data is encrypted in transit and at rest' },
    { icon: Eye, title: 'Transparency', description: 'Clear information about how we use your data' },
    { icon: UserCheck, title: 'Your Control', description: 'You control your data and privacy settings' },
    { icon: Trash2, title: 'Right to Delete', description: 'Request deletion of your data anytime' },
  ];

  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, including:
      
• **Account Information**: Name, email address, profile photo, location (city/country), and environmental interests when you create an account.
• **Wallet Information**: Cryptocurrency wallet addresses for receiving B3TR token rewards.
• **Cleanup Data**: Information about cleanups you organize or participate in, including locations, dates, and participation records.
• **Proof of Work**: Photos and videos you submit as evidence of cleanup participation.
• **Communications**: Messages and feedback you send to us or other users through the Platform.
• **KYC Information**: Identity documents and verification data when required for compliance purposes.`
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:
      
• Provide, maintain, and improve the CleanUp Platform
• Process and distribute B3TR token rewards
• Verify cleanup participation and proof of work submissions
• Connect you with cleanup events and other environmental champions
• Send you notifications about events, rewards, and platform updates
• Analyze usage patterns to improve user experience
• Comply with legal obligations and prevent fraud
• Communicate with you about your account and our services`
    },
    {
      title: '3. Information Sharing',
      content: `We may share your information in the following circumstances:
      
• **Public Profile**: Your name, profile photo, and cleanup participation history may be visible to other users.
• **Event Organizers**: When you join a cleanup, the organizer can see your basic profile information.
• **Blockchain**: Wallet addresses and reward transactions are recorded on the public blockchain.
• **Service Providers**: We share data with third-party services that help us operate the Platform (hosting, analytics, etc.).
• **Legal Requirements**: We may disclose information when required by law or to protect rights and safety.
• **Business Transfers**: In the event of a merger or acquisition, your information may be transferred.`
    },
    {
      title: '4. Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
      
• Encryption of data in transit using TLS/SSL
• Encryption of sensitive data at rest
• Regular security audits and vulnerability assessments
• Access controls and authentication measures
• Employee training on data protection

However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`
    },
    {
      title: '5. Your Privacy Rights',
      content: `Depending on your location, you may have the following rights:
      
• **Access**: Request a copy of your personal data
• **Correction**: Update or correct inaccurate information
• **Deletion**: Request deletion of your personal data
• **Portability**: Receive your data in a portable format
• **Objection**: Object to certain processing of your data
• **Restriction**: Request restriction of processing
• **Withdraw Consent**: Withdraw consent where processing is based on consent

To exercise these rights, please contact us through the Help Center or at privacy@cleanup.app.`
    },
    {
      title: '6. Cookies and Tracking',
      content: `We use cookies and similar technologies to:
      
• Keep you logged in to your account
• Remember your preferences and settings
• Analyze how the Platform is used
• Improve our services and user experience

You can control cookies through your browser settings. Note that disabling cookies may affect some Platform functionality.`
    },
    {
      title: '7. Data Retention',
      content: `We retain your personal information for as long as necessary to:
      
• Provide our services to you
• Comply with legal obligations
• Resolve disputes and enforce agreements
• Maintain blockchain records (which are permanent)

When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law or for legitimate business purposes.`
    },
    {
      title: '8. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses and other legally approved mechanisms.`
    },
    {
      title: '9. Children\'s Privacy',
      content: `CleanUp is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.`
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on the Platform and updating the "Last Updated" date. Your continued use of CleanUp after changes constitutes acceptance of the updated policy.`
    },
    {
      title: '11. Contact Us',
      content: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
      
• Email: privacy@cleanup.app
• Help Center: Available through the Platform
• Mail: CleanUp Privacy Team, [Address]

We will respond to your inquiry within 30 days.`
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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: December 2024</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Privacy Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1 }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Introduction */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              At CleanUp, we are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information. This Privacy Policy explains our data practices and your rights regarding your personal data.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.03 }}
              >
                <h2 className="text-xl font-semibold mb-3 text-foreground">{section.title}</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Your privacy matters to us. If you have any questions, please don't hesitate to reach out.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
