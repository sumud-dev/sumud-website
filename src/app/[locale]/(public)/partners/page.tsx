"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Globe,
  Award,
  Star,
  ExternalLink,
  BookOpen,
  Megaphone,
  Building,
  HandHeart,
  Quote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Separator } from "@/src/components/ui/separator";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

// Partnership statistics
const partnershipStats = [
  {
    icon: HandHeart,
    number: "25+",
    label: "Partner Organizations",
    description: "Collaborative network",
    color: "bg-[#781D32]",
  },
  {
    icon: Globe,
    number: "12",
    label: "Countries",
    description: "International partners",
    color: "bg-[#55613C]",
  },
  {
    icon: Award,
    number: "50+",
    label: "Joint Initiatives",
    description: "Collaborative projects",
    color: "bg-[#3E442B]",
  },
  {
    icon: Star,
    number: "5",
    label: "Years",
    description: "Partnership building",
    color: "bg-[#781D32]",
  },
];

// Partner data
const featuredPartners = [
  {
    id: "1",
    name: "Palestinian Cultural Centre Finland",
    description: "Promoting Palestinian culture and heritage through arts, education, and community events across Finland.",
    logo: "/images/partners/pcc-finland.jpg",
    website: "https://palestinianculture.fi",
    category: "cultural" as const,
    partnershipType: "featured" as const,
    collaborationDescription: "Joint cultural events and educational workshops",
    testimonial: "Sumud has been an invaluable partner in our mission to preserve and share Palestinian culture in Finland.",
    since: "2022",
  },
  {
    id: "2",
    name: "University of Helsinki",
    description: "Leading Finnish university supporting academic research and dialogue on Middle Eastern studies.",
    logo: "/images/partners/university-helsinki.jpg",
    website: "https://helsinki.fi",
    category: "educational" as const,
    partnershipType: "featured" as const,
    collaborationDescription: "Academic conferences and research initiatives",
    testimonial: "Our collaboration has enriched our Middle Eastern studies program significantly.",
    since: "2022",
  },
  {
    id: "3",
    name: "Yle News",
    description: "Finland's national broadcasting company committed to balanced and comprehensive news coverage.",
    logo: "/images/partners/yle.jpg",
    website: "https://yle.fi",
    category: "media" as const,
    partnershipType: "featured" as const,
    collaborationDescription: "Media partnerships and educational content",
    since: "2023",
  },
];

const ngoPartners = [
  {
    id: "4",
    name: "Amnesty International Finland",
    description: "Human rights organization working for justice and freedom worldwide.",
    logo: "/images/partners/amnesty.jpg",
    website: "https://amnesty.fi",
    category: "ngo" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Human rights advocacy and campaigns",
    since: "2022",
  },
  {
    id: "5",
    name: "Finnish Peace Union",
    description: "Promoting peace, disarmament, and conflict resolution through dialogue.",
    logo: "/images/partners/peace-union.jpg",
    website: "https://rauhanliitto.fi",
    category: "ngo" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Peace education and conflict resolution workshops",
    since: "2023",
  },
  {
    id: "6",
    name: "Medical Aid for Palestinians",
    description: "Providing medical aid and healthcare support to Palestinian communities.",
    logo: "/images/partners/map.jpg",
    website: "https://map.org.uk",
    category: "ngo" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Healthcare awareness and fundraising campaigns",
    since: "2023",
  },
];

const educationalPartners = [
  {
    id: "7",
    name: "Aalto University",
    description: "Multidisciplinary university fostering innovation and critical thinking.",
    logo: "/images/partners/aalto.jpg",
    website: "https://aalto.fi",
    category: "educational" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Student exchange programs and research collaboration",
    since: "2023",
  },
  {
    id: "8",
    name: "Helsinki Metropolitan Area Libraries",
    description: "Public library network promoting education and cultural diversity.",
    logo: "/images/partners/helmet.jpg",
    website: "https://helmet.fi",
    category: "educational" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Educational events and cultural programming",
    since: "2023",
  },
];

const mediaPartners = [
  {
    id: "9",
    name: "Helsingin Sanomat",
    description: "Finland's largest subscription newspaper covering national and international news.",
    logo: "/images/partners/hs.jpg",
    website: "https://hs.fi",
    category: "media" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Opinion pieces and educational content",
    since: "2023",
  },
  {
    id: "10",
    name: "Radio Helsinki",
    description: "Community radio station promoting diverse voices and cultural dialogue.",
    logo: "/images/partners/radio-helsinki.jpg",
    website: "https://radiohelsinki.fi",
    category: "media" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Regular programming and interviews",
    since: "2023",
  },
];

const communityPartners = [
  {
    id: "11",
    name: "Islamic Society of Finland",
    description: "Supporting Muslim communities and promoting interfaith dialogue in Finland.",
    logo: "/images/partners/islamic-society.jpg",
    website: "https://islam.fi",
    category: "community" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Interfaith dialogue and community events",
    since: "2022",
  },
  {
    id: "12",
    name: "Helsinki Refugee Council",
    description: "Supporting refugees and asylum seekers with integration and advocacy.",
    logo: "/images/partners/refugee-council.jpg",
    website: "https://pakolaisapu.fi",
    category: "community" as const,
    partnershipType: "regular" as const,
    collaborationDescription: "Refugee support and integration programs",
    since: "2023",
  },
];

interface Partner {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  category: 'ngo' | 'educational' | 'media' | 'community' | 'cultural';
  partnershipType: 'featured' | 'regular';
  collaborationDescription: string;
  testimonial?: string;
  since: string;
}

function PartnerCard({ partner }: { partner: Partner }) {
  const initials = partner.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const categoryColors = {
    ngo: "bg-[#781D32]/10 text-[#781D32]",
    educational: "bg-[#55613C]/10 text-[#55613C]",
    media: "bg-[#3E442B]/10 text-[#3E442B]",
    community: "bg-[#781D32]/10 text-[#781D32]",
    cultural: "bg-[#55613C]/10 text-[#55613C]",
  };

  const categoryIcons = {
    ngo: HandHeart,
    educational: BookOpen,
    media: Megaphone,
    community: Users,
    cultural: Award,
  };

  const CategoryIcon = categoryIcons[partner.category];

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#55613C]/20">
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <div className="flex items-start space-x-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={partner.logo} alt={partner.name} />
              <AvatarFallback className="bg-[#781D32] text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#3E442B] mb-1 line-clamp-2">
                {partner.name}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge className={categoryColors[partner.category]}>
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {partner.category.charAt(0).toUpperCase() + partner.category.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">Since {partner.since}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {partner.description}
          </p>

          <div className="mt-auto space-y-3">
            <div>
              <h4 className="text-sm font-medium text-[#3E442B] mb-1">Collaboration:</h4>
              <p className="text-sm text-gray-600">{partner.collaborationDescription}</p>
            </div>

            {partner.testimonial && (
              <div className="bg-[#F4F3F0] p-3 rounded-lg">
                <Quote className="w-4 h-4 text-[#781D32] mb-2" />
                <p className="text-sm text-gray-700 italic">"{partner.testimonial}"</p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 border-[#781D32] text-[#781D32] hover:bg-[#781D32] hover:text-white"
              asChild
            >
              <a href={partner.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PartnersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#F4F3F0] to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Badge className="mb-4 bg-[#781D32]/10 text-[#781D32] border-[#781D32]/20">
              Our Partners
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Building Bridges Together
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Our strength lies in collaboration. We work with diverse organizations across Finland
              and internationally to amplify Palestinian voices and build solidarity through education,
              advocacy, and cultural exchange.
            </p>
          </motion.div>

          {/* Partnership Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partnershipStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center border-2 border-transparent hover:border-[#55613C]/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-[#3E442B] mb-1">
                      {stat.number}
                    </div>
                    <div className="font-medium text-[#781D32] mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Partners Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#3E442B] mb-4">Featured Partners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our key strategic partners who have made significant contributions
              to our mission and community impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <PartnerCard partner={partner} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-[#55613C]/10" />

      {/* Partner Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#3E442B] mb-4">Partner Organizations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse network of partners across different sectors,
              each contributing unique expertise and resources to our shared mission.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="ngo" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-white">
                <TabsTrigger value="ngo" className="data-[state=active]:bg-[#781D32] data-[state=active]:text-white">
                  NGOs
                </TabsTrigger>
                <TabsTrigger value="educational" className="data-[state=active]:bg-[#781D32] data-[state=active]:text-white">
                  Educational
                </TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:bg-[#781D32] data-[state=active]:text-white">
                  Media
                </TabsTrigger>
                <TabsTrigger value="community" className="data-[state=active]:bg-[#781D32] data-[state=active]:text-white">
                  Community
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ngo" className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ngoPartners.map((partner, index) => (
                    <motion.div
                      key={partner.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <PartnerCard partner={partner} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="educational" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {educationalPartners.map((partner, index) => (
                    <motion.div
                      key={partner.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <PartnerCard partner={partner} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {mediaPartners.map((partner, index) => (
                    <motion.div
                      key={partner.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <PartnerCard partner={partner} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="community" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {communityPartners.map((partner, index) => (
                    <motion.div
                      key={partner.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <PartnerCard partner={partner} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Become Partner CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#781D32] to-[#55613C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Become a Partner
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our network of committed organizations working for Palestinian solidarity.
              Together, we can amplify our impact and build bridges for justice and peace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#781D32] hover:bg-white/90 font-semibold"
                asChild
              >
                <a href="/contact">
                  <HandHeart className="mr-2 h-4 w-4" />
                  Partner With Us
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#781D32]"
                asChild
              >
                <a href="/about">
                  <Building className="mr-2 h-4 w-4" />
                  Learn About Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}