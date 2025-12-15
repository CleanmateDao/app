import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  Trophy, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  Target,
  Globe,
  Star,
  ChevronRight,
  Play,
  Shield,
  Zap,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import africanPattern from '@/assets/african-pattern-decorative.jpg';
import africanMask from '@/assets/african-mask.jpg';
import africanMasksPattern from '@/assets/african-masks-pattern.jpg';

const stats = [
  { value: '50K+', label: 'Cleanups Completed', icon: Leaf },
  { value: '250K+', label: 'Active Champions', icon: Users },
  { value: '1.2M+', label: 'Kg Waste Collected', icon: Target },
  { value: '45+', label: 'Countries', icon: Globe },
];

const features = [
  {
    icon: MapPin,
    title: 'Discover Nearby',
    description: 'Find cleanup events in your area with our interactive map and smart location discovery.',
  },
  {
    icon: Users,
    title: 'Build Community',
    description: 'Connect with environmental champions and grow your impact together as a team.',
  },
  {
    icon: Trophy,
    title: 'Earn Rewards',
    description: 'Get B3TR tokens for every cleanup. Real environmental impact, real crypto rewards.',
  },
  {
    icon: Shield,
    title: 'Verified Impact',
    description: 'Submit proof of work and get your contributions verified and recorded on-chain.',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up in under 2 minutes and tell us about your environmental interests.',
    icon: Sparkles,
  },
  {
    step: '02',
    title: 'Organize or Join',
    description: 'Create your own cleanup event or discover ones happening near you.',
    icon: MapPin,
  },
  {
    step: '03',
    title: 'Earn & Impact',
    description: 'Participate, submit proof of work, and earn B3TR token rewards.',
    icon: Trophy,
  },
];

const testimonials = [
  {
    name: 'Amara Okonkwo',
    role: 'Community Organizer',
    location: 'Lagos, Nigeria',
    quote: 'CleanMate transformed how we mobilize our community. 50+ beach cleanups and counting!',
    rating: 5,
  },
  {
    name: 'David Kimani',
    role: 'Environmental Activist',
    location: 'Nairobi, Kenya',
    quote: 'Our volunteer retention increased by 300% since using the platform. The gamification works!',
    rating: 5,
  },
  {
    name: 'Fatima Diallo',
    role: 'NGO Director',
    location: 'Dakar, Senegal',
    quote: 'Earning B3TR tokens opened new funding opportunities. Building a sustainable future together.',
    rating: 5,
  },
];

const moreTestimonials = [
  {
    name: 'Kwame Asante',
    role: 'Youth Leader',
    location: 'Accra, Ghana',
    quote: 'The platform made it easy to engage young people. We\'ve organized 30 cleanups in just 3 months!',
    rating: 5,
  },
  {
    name: 'Zara Mohammed',
    role: 'Volunteer Coordinator',
    location: 'Cairo, Egypt',
    quote: 'Finally a platform that rewards real environmental action. Our community is more motivated than ever.',
    rating: 5,
  },
  {
    name: 'James Obi',
    role: 'Environmental Engineer',
    location: 'Abuja, Nigeria',
    quote: 'The proof of work verification gives credibility to our cleanup efforts. Donors trust our impact now.',
    rating: 5,
  },
];

const benefits = [
  'Free to join and organize',
  'Earn crypto rewards for impact',
  'Connect with global community',
  'Verified environmental contributions',
];

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const isOnboarded = localStorage.getItem('onboardingComplete') === 'true';
    navigate(isOnboarded ? '/dashboard' : '/onboarding');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          {/* African Pattern Accent */}
          <div 
            className="absolute -right-20 top-32 w-96 h-96 rounded-full opacity-[0.02] dark:opacity-[0.04]"
            style={{
              backgroundImage: `url(${africanPattern})`,
              backgroundSize: 'cover',
            }}
          />
        </div>

        {/* Floating Geometric Shapes - More subtle */}
        <motion.div
          className="absolute top-32 left-[10%] w-24 h-24 border border-border rounded-3xl"
          animate={{ rotate: [0, 90, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-48 right-[15%] w-16 h-16 bg-muted rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-[20%] w-32 h-32 border-2 border-dashed border-border rounded-full"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-48 right-[25%] w-8 h-8 bg-foreground/10 rounded-lg"
          animate={{ y: [0, -30, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        {/* Subtle Gradient Orbs */}
        <div className="absolute top-40 left-[5%] w-72 h-72 rounded-full bg-muted/50 blur-[120px]" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-muted/30 blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 px-4 py-2 text-sm bg-muted text-foreground border-border">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Earn B3TR tokens for impact
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
                <span className="text-foreground">Clean the</span>
                <br />
                <span className="relative">
                  <span className="text-primary">Planet.</span>
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <motion.path
                      d="M0 6 Q50 0, 100 6 T200 6"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
                <br />
                <span className="text-muted-foreground">Get Rewarded.</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Join thousands of environmental champions organizing cleanups across Africa. 
                Real impact, real crypto rewards.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted} 
                  className="gap-2 text-lg px-8 h-14 shadow-lg shadow-primary/25"
                >
                  Start Organizing
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 h-14">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Quick Benefits */}
              <div className="grid grid-cols-2 gap-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-foreground flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Main Card Stack */}
              <div className="relative">
                {/* Background Card */}
                <motion.div 
                  className="absolute -top-4 -left-4 w-full h-full bg-muted/50 rounded-3xl border border-border"
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                
                {/* Main Image */}
                <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl">
                  <img 
                    src={africanMask} 
                    alt="Environmental cleanup" 
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  
                  {/* Overlay Stats */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-4 border border-border">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-foreground">50K+</p>
                          <p className="text-xs text-muted-foreground">Cleanups</p>
                        </div>
                        <div className="border-x border-border">
                          <p className="text-2xl font-bold text-foreground">250K+</p>
                          <p className="text-xs text-muted-foreground">Champions</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">45+</p>
                          <p className="text-xs text-muted-foreground">Countries</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div 
                  className="absolute -top-6 -right-6 bg-card border border-border rounded-2xl p-4 shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">+50 B3TR</p>
                      <p className="text-xs text-muted-foreground">Earned today</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating User Avatars */}
                <motion.div 
                  className="absolute -bottom-4 -left-8 bg-card border border-border rounded-2xl p-3 shadow-xl"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted-foreground/30 border-2 border-card"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">+2.5K joined</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-foreground"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-8">Trusted by leading environmental organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {['VeChain', 'B3TR', 'GreenAfrica', 'EcoWarriors', 'CleanOcean'].map((brand) => (
              <div key={brand} className="text-xl font-bold text-muted-foreground">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-0 w-64 h-64 bg-muted/50 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 text-muted-foreground">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Everything You Need</span>
              <br />
              <span className="text-muted-foreground">to Make an Impact</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you organize cleanups, build community, and track your environmental contributions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-border/50 hover:border-foreground/20 transition-all hover:shadow-xl group bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:scale-110 transition-all">
                        <Icon className="w-7 h-7 text-foreground group-hover:text-background transition-colors" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground/90">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-muted/50" />
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url(${africanMasksPattern})`,
            backgroundSize: '300px',
            backgroundRepeat: 'repeat',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 text-muted-foreground">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Start in</span> <span className="text-muted-foreground">3 Simple Steps</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From sign-up to earning rewards, get started in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
            
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-20 h-20 rounded-3xl bg-foreground flex items-center justify-center shadow-xl">
                        <Icon className="w-10 h-10 text-background" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary border-2 border-card flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button size="lg" onClick={handleGetStarted} className="gap-2">
              Get Started Now
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${africanPattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 opacity-95" />
        
        {/* Accent Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[200px]" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-white/10 text-white border-white/20">
              Our Impact
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Together, We're Making
              <br />a Real Difference
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-12">
              Every cleanup counts. See the collective impact of our global community.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { label: 'Beaches Cleaned', value: '2,400+', icon: Leaf },
                { label: 'Trees Planted', value: '15,000+', icon: Target },
                { label: 'Communities Reached', value: '890+', icon: Globe },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-5xl md:text-6xl font-bold text-white mb-2">
                      {item.value}
                    </p>
                    <p className="text-white/60">{item.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Marquee */}
      <section id="testimonials" className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-muted/50 rounded-full blur-[150px]" />
        
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 px-6"
          >
            <Badge variant="outline" className="mb-4 text-muted-foreground">Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Hear from</span> <span className="text-muted-foreground">Our Champions</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from organizers making a difference in their communities.
            </p>
          </motion.div>

          {/* Marquee Container */}
          <div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
            
            {/* First Row - Left to Right */}
            <div className="flex gap-6 mb-6 animate-marquee">
              {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                <Card key={`row1-${index}`} className="flex-shrink-0 w-[400px] border-border/50 hover:border-foreground/20 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center text-background font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Second Row - Right to Left */}
            <div className="flex gap-6 animate-marquee-reverse">
              {[...moreTestimonials, ...moreTestimonials, ...moreTestimonials].map((testimonial, index) => (
                <Card key={`row2-${index}`} className="flex-shrink-0 w-[400px] border-border/50 hover:border-foreground/20 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center text-background font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-3xl overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url(${africanMask})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              {/* Accent */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[150px]" />
              
              <div className="relative p-12 md:p-16 text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Zap className="w-10 h-10 text-neutral-900" />
                </motion.div>
                
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Ready to Make an Impact?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                  Join thousands of environmental champions and start organizing your first cleanup today. Takes less than 2 minutes.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted} 
                    className="gap-2 text-lg px-8 h-14"
                  >
                    Start For Free
                    <ArrowUpRight className="w-5 h-5" />
                  </Button>
                </div>
                
                <p className="text-sm text-white/50 mt-6">No credit card required • Free forever</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
