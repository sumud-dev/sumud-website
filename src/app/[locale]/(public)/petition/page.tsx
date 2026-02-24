"use client";

import React, { useState, useMemo } from "react";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  PenLine,
  Search,
  Filter,
  Check,
  ArrowRight,
  Users,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Card, CardContent } from "@/src/components/ui/card";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Mock petition data
interface Petition {
  id: string;
  slug: string;
  title: string;
  description: string;
  signatureCount: number;
  targetSignatures: number;
  status: "active" | "successful" | "closed";
  category: string;
}

const MOCK_PETITIONS: Petition[] = [
  {
    id: "1",
    slug: "end-occupation-now",
    title: "End the Occupation: Call for Immediate Ceasefire",
    description:
      "Demand an immediate end to violence and a path toward lasting peace for all people in Palestine.",
    signatureCount: 47382,
    targetSignatures: 50000,
    status: "active",
    category: "Peace & Justice",
  },
  {
    id: "2",
    slug: "protect-palestinian-heritage",
    title: "Protect Palestinian Cultural Heritage Sites",
    description:
      "Preserve historical sites and cultural landmarks that represent centuries of Palestinian history.",
    signatureCount: 28934,
    targetSignatures: 30000,
    status: "active",
    category: "Cultural Rights",
  },
  {
    id: "3",
    slug: "humanitarian-aid-access",
    title: "Ensure Humanitarian Aid Access to Gaza",
    description:
      "Guarantee safe passage for critical medical supplies, food, and humanitarian assistance to those in need.",
    signatureCount: 62150,
    targetSignatures: 75000,
    status: "active",
    category: "Humanitarian",
  },
  {
    id: "4",
    slug: "right-to-return",
    title: "Support the Right of Return for Palestinian Refugees",
    description:
      "Stand with Palestinian refugees in their fundamental right to return to their ancestral homes.",
    signatureCount: 50000,
    targetSignatures: 50000,
    status: "successful",
    category: "Human Rights",
  },
  {
    id: "5",
    slug: "education-for-all",
    title: "Protect Palestinian Children's Right to Education",
    description:
      "Ensure safe access to schools and educational resources for all Palestinian children.",
    signatureCount: 35789,
    targetSignatures: 40000,
    status: "active",
    category: "Education",
  },
  {
    id: "6",
    slug: "press-freedom",
    title: "Defend Press Freedom and Journalists in Palestine",
    description:
      "Protect journalists documenting events and ensure freedom of press in Palestinian territories.",
    signatureCount: 41256,
    targetSignatures: 45000,
    status: "active",
    category: "Press Freedom",
  },
];

const FILTER_OPTIONS = ["All", "Active", "Successful"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "recent", label: "Most Recent" },
  { value: "most_signed", label: "Most Signed" },
];

export default function PetitionPage() {
  const t = useTranslations("petition");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Filter and sort petitions
  const filteredPetitions = useMemo(() => {
    let filtered = [...MOCK_PETITIONS];

    // Status filter
    if (selectedFilter !== "All") {
      const statusFilter = selectedFilter.toLowerCase();
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "recent":
        // For demo, reverse order
        filtered = [...filtered].reverse();
        break;
      case "most_signed":
        filtered = [...filtered].sort(
          (a, b) => b.signatureCount - a.signatureCount
        );
        break;
      case "featured":
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [selectedFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
      {/* Hero Section with Liquid Glass */}
      <motion.section
        className="relative py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Gradient Background with Palestinian Colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#781D32] via-[#722F37] to-[#55613C]" />

        {/* Decorative Glass Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-[10%] w-72 h-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 248, 240, 0.15) 0%, rgba(255, 248, 240, 0) 70%)",
              filter: "blur(40px)",
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-[15%] w-96 h-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(107, 142, 35, 0.2) 0%, rgba(107, 142, 35, 0) 70%)",
              filter: "blur(50px)",
            }}
            animate={{
              y: [0, 30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Dotted Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center space-y-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {/* Glass Icon Container */}
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 backdrop-blur-xl"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "0.5px solid rgba(255, 255, 255, 0.3)",
                boxShadow:
                  "0 8px 16px -4px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <PenLine className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
              Active Petitions
              <span className="block text-3xl lg:text-4xl font-medium opacity-90 mt-3">
                Make Your Voice Heard
              </span>
            </h1>

            <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
              Join thousands in calling for change
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Search and Filters Section */}
      <motion.section
        className="py-8 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass-strong blur-transition border-glass-glow shadow-glass-xl rounded-3xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search petitions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 backdrop-blur-sm rounded-xl border-gray-200/60"
                    style={{
                      background: "rgba(255, 248, 240, 0.6)",
                    }}
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-3 items-center flex-wrap">
                  <Filter className="h-5 w-5 text-[#722F37]" />
                  <div className="flex gap-2">
                    {FILTER_OPTIONS.map((filter) => (
                      <Button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        variant={
                          selectedFilter === filter ? "default" : "outline"
                        }
                        size="sm"
                        className={`rounded-full transition-all duration-200 ${
                          selectedFilter === filter
                            ? "bg-[#781D32] hover:bg-[#781D32]/90 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      className="w-48 h-10 rounded-xl backdrop-blur-sm border-gray-200/60"
                      style={{
                        background: "rgba(255, 248, 240, 0.6)",
                      }}
                    >
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Petitions Grid */}
      <motion.section
        className="py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPetitions.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl"
                style={{
                  background: "rgba(107, 142, 35, 0.12)",
                  border: "0.5px solid rgba(107, 142, 35, 0.3)",
                }}
              >
                <Search className="h-12 w-12 text-[#6B8E23]" />
              </div>
              <h3 className="text-3xl font-bold text-[#3E442B] mb-3">
                No Petitions Found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Try adjusting your filters or search query
              </p>
              <Button
                onClick={() => {
                  setSelectedFilter("All");
                  setSearchQuery("");
                }}
                className="bg-[#781D32] hover:bg-[#781D32]/90 text-white rounded-full"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredPetitions.map((petition, index) => (
                <motion.div
                  key={petition.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PetitionCard petition={petition} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

// Petition Card Component
interface PetitionCardProps {
  petition: Petition;
}

function PetitionCard({ petition }: PetitionCardProps) {
  const progress =
    (petition.signatureCount / petition.targetSignatures) * 100;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group h-full"
    >
      <Card className="glass-strong blur-transition border-glass-glow shadow-glass-lg hover:shadow-glass-xl gpu-accelerated rounded-3xl h-full flex flex-col transition-all duration-300">
        <CardContent className="p-6 flex flex-col flex-1">
          {/* Status Badge */}
          <div className="mb-4">
            <Badge
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                petition.status === "active"
                  ? "bg-[#781D32] text-white"
                  : petition.status === "successful"
                    ? "bg-[#55613C] text-white"
                    : "bg-gray-400 text-white"
              }`}
            >
              {petition.status === "active" && (
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              )}
              {petition.status === "successful" && (
                <Check className="inline-block w-3 h-3 mr-1" />
              )}
              {petition.status.charAt(0).toUpperCase() +
                petition.status.slice(1)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-[#3E442B] mb-3 line-clamp-2 group-hover:text-[#781D32] transition-colors duration-200">
            {petition.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            {petition.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-sm text-gray-700">
                <Users className="w-4 h-4 mr-1 text-[#781D32]" />
                <span className="font-semibold">
                  {petition.signatureCount.toLocaleString()}
                </span>
                <span className="text-gray-500 ml-1">signatures</span>
              </div>
              <span className="text-xs text-gray-500">
                Goal: {petition.targetSignatures.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #781D32 0%, #55613C 100%)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            {/* Progress Percentage */}
            <div className="mt-1 text-right">
              <span className="text-xs font-medium text-[#781D32]">
                {Math.round(progress)}% reached
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href={`/petition/${petition.slug}`} className="mt-auto">
            <Button
              className="w-full bg-[#781D32] hover:bg-[#781D32]/90 text-white rounded-full h-11 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 group/btn"
              disabled={petition.status !== "active"}
            >
              <PenLine className="mr-2 h-4 w-4" />
              {petition.status === "active"
                ? "Sign This Petition"
                : petition.status === "successful"
                  ? "View Details"
                  : "Petition Closed"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>

          {/* Category Tag */}
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-500 font-medium">
              {petition.category}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
