"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, List, Clock, Plus, GripVertical } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { SubCampaignCard } from "./SubCampaignCard";

// Local campaign interface for this component
interface CampaignBase {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  campaignType?: string | null;
  status?: string | null;
  sectionType?: string | null;
  iconName?: string | null;
  featuredImageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  _count?: { updates: number; translations: number; subCampaigns: number };
}

type Campaign = CampaignBase;

type ViewMode = "grid" | "timeline" | "list";

interface SubCampaignSectionProps {
  parentCampaign: Campaign & {
    subCampaigns?: Array<
      Campaign & {
        _count?: {
          updates: number;
          translations: number;
          subCampaigns: number;
        };
      }
    >;
  };
  onSubCampaignClick?: (campaign: Campaign) => void;
  onAddSubCampaign?: () => void;
  isAdmin?: boolean;
  defaultViewMode?: ViewMode;
  showAccordion?: boolean;
  title?: string;
}

export function SubCampaignSection({
  parentCampaign,
  onSubCampaignClick,
  onAddSubCampaign,
  isAdmin = false,
  defaultViewMode = "grid",
  showAccordion = false,
  title = "Initiatives",
}: SubCampaignSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const subCampaigns = parentCampaign.subCampaigns ?? [];

  if (subCampaigns.length === 0 && !isAdmin) {
    return null;
  }

  const content = (
    <>
      {/* Header with view mode toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {subCampaigns.length} initiative{subCampaigns.length !== 1 && "s"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode buttons */}
          <div className="flex items-center border rounded-lg p-1 bg-gray-50">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "timeline" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("timeline")}
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {isAdmin && onAddSubCampaign && (
            <Button
              onClick={onAddSubCampaign}
              size="sm"
              className="bg-[#781D32] hover:bg-[#5a1626]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Initiative
            </Button>
          )}
        </div>
      </div>

      {/* Sub-campaigns display */}
      {subCampaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No initiatives yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add sub-campaigns to organize this campaign into sections
          </p>
          {isAdmin && onAddSubCampaign && (
            <Button
              onClick={onAddSubCampaign}
              variant="outline"
              className="border-[#781D32] text-[#781D32] hover:bg-[#781D32] hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Initiative
            </Button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {subCampaigns.map((sub, idx) => (
                <div key={sub.id} className="relative group">
                  {isAdmin && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <SubCampaignCard
                    campaign={sub}
                    index={idx}
                    variant="card"
                    onClick={() => onSubCampaignClick?.(sub)}
                  />
                </div>
              ))}
            </motion.div>
          )}

          {viewMode === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              {subCampaigns.map((sub, idx) => (
                <SubCampaignCard
                  key={sub.id}
                  campaign={sub}
                  index={idx}
                  variant="timeline"
                  onClick={() => onSubCampaignClick?.(sub)}
                />
              ))}
            </motion.div>
          )}

          {viewMode === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {subCampaigns.map((sub, idx) => (
                <SubCampaignCard
                  key={sub.id}
                  campaign={sub}
                  index={idx}
                  variant="compact"
                  onClick={() => onSubCampaignClick?.(sub)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );

  // With accordion wrapper
  if (showAccordion) {
    return (
      <section className="py-8">
        <Accordion type="single" collapsible defaultValue="initiatives">
          <AccordionItem value="initiatives" className="border-none">
            <AccordionTrigger className="hover:no-underline py-0 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#3e442b]">{title}</h2>
                <span className="px-2 py-0.5 bg-[#781D32]/10 text-[#781D32] text-sm font-medium rounded-full">
                  {subCampaigns.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">{content}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    );
  }

  // Without accordion
  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#3e442b]">{title}</h2>
        <span className="px-2 py-0.5 bg-[#781D32]/10 text-[#781D32] text-sm font-medium rounded-full">
          {subCampaigns.length}
        </span>
      </div>
      {content}
    </section>
  );
}

// Scrollspy navigation component for one-page layout
interface CampaignScrollspyNavProps {
  subCampaigns: Campaign[];
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function CampaignScrollspyNav({
  subCampaigns,
  activeSection,
  onSectionClick,
}: CampaignScrollspyNavProps) {
  return (
    <nav className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b py-3">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {subCampaigns.map((sub) => (
            <li key={sub.id}>
              <button
                onClick={() => onSectionClick?.(sub.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  activeSection === sub.id
                    ? "bg-[#781D32] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {sub.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
