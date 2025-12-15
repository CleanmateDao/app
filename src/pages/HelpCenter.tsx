import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Wallet,
  MapPin,
  Trophy,
  Users,
  Settings,
  ChevronRight,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const categories = [
  { icon: BookOpen, title: 'Getting Started', description: 'New to CleanUp? Start here', count: 8 },
  { icon: MapPin, title: 'Cleanups', description: 'Organizing & joining events', count: 12 },
  { icon: Trophy, title: 'Rewards', description: 'B3TR tokens & earnings', count: 6 },
  { icon: Wallet, title: 'Wallet', description: 'Connecting & managing wallets', count: 5 },
  { icon: Users, title: 'Community', description: 'Teams & collaboration', count: 7 },
  { icon: Settings, title: 'Account', description: 'Profile & settings', count: 9 },
];

const popularArticles = [
  { title: 'How to organize your first cleanup', category: 'Getting Started' },
  { title: 'Understanding B3TR token rewards', category: 'Rewards' },
  { title: 'Connecting your VeChain wallet', category: 'Wallet' },
  { title: 'Submitting proof of work', category: 'Cleanups' },
  { title: 'Managing your team members', category: 'Community' },
];

const faqs = [
  {
    question: 'How do I create my first cleanup event?',
    answer: 'To create a cleanup event, go to the Dashboard and click "Organize Cleanup". Fill in the basic information (title, description, category), set the location using the map, choose a date and time, and optionally add cover images. Once submitted, your event will be visible to other users who can apply to join.'
  },
  {
    question: 'How do B3TR token rewards work?',
    answer: 'B3TR tokens are earned by participating in and organizing cleanups. Organizers earn 50 B3TR per completed cleanup, plus 10 B3TR for each verified participant. Participants earn tokens based on their contribution and organizer ratings. Rewards are distributed after proof of work is verified by moderators.'
  },
  {
    question: 'What is proof of work and how do I submit it?',
    answer: 'Proof of work consists of photos or videos showing your participation in a cleanup. After completing a cleanup, you can submit proof through the cleanup detail page. Include clear images of the cleanup area before and after, or photos of you actively participating. Moderators review submissions within 1-3 days.'
  },
  {
    question: 'How do I connect my wallet to receive rewards?',
    answer: 'Go to Settings > Wallets to connect your VeChain wallet. You can either use the "Connect Wallet" button to connect via WalletConnect or manually enter your wallet address. Make sure to use a VeChain-compatible wallet to receive B3TR tokens.'
  },
  {
    question: 'Can I participate in cleanups without a wallet?',
    answer: 'Yes! You can join and participate in cleanups without connecting a wallet. However, you will need to connect a VeChain wallet to receive B3TR token rewards. You can add your wallet anytime in Settings.'
  },
  {
    question: 'How do I find cleanups near me?',
    answer: 'The Cleanups page shows events on both a map and list view. Use the map to visually find nearby events, or switch to list view and use filters to search by location, date, or category. The platform uses your set location from your profile to suggest nearby events.'
  },
  {
    question: 'What happens if I need to cancel a cleanup I organized?',
    answer: 'You can cancel a cleanup from the cleanup detail page if you\'re the organizer. It\'s best practice to notify participants beforehand. Canceled cleanups won\'t affect your reputation, but frequent cancellations may impact participant trust.'
  },
  {
    question: 'How does the rating system work?',
    answer: 'After a cleanup ends, organizers rate participants on a 1-5 star scale based on their contribution, punctuality, and teamwork. These ratings build your reputation and may affect future reward amounts. Participants can also provide feedback on event organization.'
  },
  {
    question: 'Is my personal information safe?',
    answer: 'Yes, we take privacy seriously. Your personal data is encrypted and stored securely. We only share minimal information with event organizers (your public profile) and never sell your data. Read our Privacy Policy for complete details on data handling.'
  },
  {
    question: 'How do I complete KYC verification?',
    answer: 'Go to Settings > KYC to complete verification. You\'ll need to provide a government-issued ID (National ID or Passport), a clear photograph, date of birth, address details, and proof of address. KYC verification typically takes 1-3 business days.'
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Search */}
      <section className="bg-muted/50 border-b border-border pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-muted-foreground mb-8">Search our knowledge base or browse categories below</p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h3 className="text-xl font-semibold mb-6">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{category.title}</h4>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{category.count} articles</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Popular Articles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h3 className="text-xl font-semibold mb-6">Popular Articles</h3>
          <Card className="border-border/50">
            <CardContent className="p-0">
              {popularArticles.map((article, index) => (
                <div
                  key={article.title}
                  className={`flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    index !== popularArticles.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground">{article.category}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h3 className="text-xl font-semibold mb-6">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground">Try a different search term or browse categories above</p>
            </div>
          )}
        </motion.section>

        {/* Contact Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Still need help?</h3>
                    <p className="text-muted-foreground">Our support team is here to assist you</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Email Support
                  </Button>
                  <Button className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
