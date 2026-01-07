"use client";

import * as React from "react";
import { Save, Plus, Trash2, GripVertical, Loader2, X } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ImageUpload } from "@/src/components/ui/image-upload";
import Image from "next/image";
import { toast } from "sonner";
import {
  getFooterConfig,
  updateFooterConfig,
  type FooterConfig,
  type NavLink,
  type SocialLink,
  type Locale,
} from "@/src/actions/navigation.actions";

interface FooterEditorProps {
  locale: Locale;
  onSaveSuccess?: () => void;
}

const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fi: "Suomi",
};

// Helper to convert config NavLink to editor format
interface EditorLink {
  labelKey: string;
  label: string;
  href: string;
}

function configLinkToEditorLink(link: NavLink, locale: Locale): EditorLink {
  return {
    labelKey: link.labelKey,
    label: link.labels[locale] || "",
    href: link.href,
  };
}

function editorLinkToConfigLink(
  editorLink: EditorLink,
  existingLink: NavLink | undefined,
  locale: Locale
): NavLink {
  return {
    labelKey: editorLink.labelKey,
    labels: {
      en: locale === "en" ? editorLink.label : existingLink?.labels.en || "",
      ar: locale === "ar" ? editorLink.label : existingLink?.labels.ar || "",
      fi: locale === "fi" ? editorLink.label : existingLink?.labels.fi || "",
    },
    href: editorLink.href,
  };
}

export default function FooterEditor({ locale, onSaveSuccess }: FooterEditorProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  
  // Store the full config to preserve other locale data
  const [fullConfig, setFullConfig] = React.useState<FooterConfig | null>(null);
  
  // Editor state for current locale
  const [description, setDescription] = React.useState("");
  const [logo, setLogo] = React.useState("");
  const [quickLinks, setQuickLinks] = React.useState<EditorLink[]>([]);
  const [getInvolvedLinks, setGetInvolvedLinks] = React.useState<EditorLink[]>([]);
  const [resourceLinks, setResourceLinks] = React.useState<EditorLink[]>([]);
  const [legalLinks, setLegalLinks] = React.useState<EditorLink[]>([]);
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>([]);
  const [newsletterTitle, setNewsletterTitle] = React.useState("");
  const [newsletterSubtitle, setNewsletterSubtitle] = React.useState("");
  const [copyright, setCopyright] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [contactLocation, setContactLocation] = React.useState("");

  // Load config on mount and when locale changes
  React.useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      try {
        const result = await getFooterConfig();
        if (result.success) {
          const config = result.data;
          setFullConfig(config);
          
          // Populate editor state with current locale data
          setDescription(config.description[locale] || "");
          setLogo(config.logo || "");
          setQuickLinks(config.quickLinks.map(l => configLinkToEditorLink(l, locale)));
          setGetInvolvedLinks(config.getInvolvedLinks.map(l => configLinkToEditorLink(l, locale)));
          setResourceLinks(config.resourceLinks.map(l => configLinkToEditorLink(l, locale)));
          setLegalLinks(config.legalLinks.map(l => configLinkToEditorLink(l, locale)));
          setSocialLinks(config.socialLinks);
          setNewsletterTitle(config.newsletter.title[locale] || "");
          setNewsletterSubtitle(config.newsletter.subtitle[locale] || "");
          setCopyright(config.copyright[locale] || "");
          setContactEmail(config.contact?.email || "");
          setContactPhone(config.contact?.phone || "");
          setContactLocation(config.contact?.location || "");
          setHasChanges(false);
        } else {
          toast.error("Failed to load footer configuration");
        }
      } catch (error) {
        console.error("Error loading footer config:", error);
        toast.error("Failed to load footer configuration");
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [locale]);

  const handleAddLink = (
    setter: React.Dispatch<React.SetStateAction<EditorLink[]>>
  ) => {
    setter((prev) => [...prev, { labelKey: "", label: "", href: "" }]);
    setHasChanges(true);
  };

  const handleRemoveLink = (
    setter: React.Dispatch<React.SetStateAction<EditorLink[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleUpdateLink = (
    setter: React.Dispatch<React.SetStateAction<EditorLink[]>>,
    index: number,
    field: keyof EditorLink,
    value: string
  ) => {
    setter((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setHasChanges(true);
  };

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "", url: "" }]);
    setHasChanges(true);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleUpdateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    setSocialLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!fullConfig) return;
    
    setIsSaving(true);
    try {
      // Build the updated config, merging current locale changes with existing data
      const updatedConfig: Omit<FooterConfig, 'updatedAt'> = {
        description: {
          ...fullConfig.description,
          [locale]: description,
        },
        logo,
        quickLinks: quickLinks.map((link, i) => 
          editorLinkToConfigLink(link, fullConfig.quickLinks[i], locale)
        ),
        getInvolvedLinks: getInvolvedLinks.map((link, i) => 
          editorLinkToConfigLink(link, fullConfig.getInvolvedLinks[i], locale)
        ),
        resourceLinks: resourceLinks.map((link, i) => 
          editorLinkToConfigLink(link, fullConfig.resourceLinks[i], locale)
        ),
        legalLinks: legalLinks.map((link, i) => 
          editorLinkToConfigLink(link, fullConfig.legalLinks[i], locale)
        ),
        socialLinks: socialLinks,
        newsletter: {
          title: {
            ...fullConfig.newsletter.title,
            [locale]: newsletterTitle,
          },
          subtitle: {
            ...fullConfig.newsletter.subtitle,
            [locale]: newsletterSubtitle,
          },
        },
        copyright: {
          ...fullConfig.copyright,
          [locale]: copyright,
        },
        contact: {
          email: contactEmail,
          phone: contactPhone,
          location: contactLocation,
        },
      };

      const result = await updateFooterConfig(updatedConfig);
      
      if (result.success) {
        setFullConfig(result.data);
        toast.success(`Footer saved for ${localeNames[locale]}`);
        setHasChanges(false);
        onSaveSuccess?.();
      } else {
        toast.error(result.error || "Failed to save footer");
      }
    } catch (error) {
      console.error("Error saving footer:", error);
      toast.error("Failed to save footer");
    } finally {
      setIsSaving(false);
    }
  };

  const LinkSection = ({
    title,
    description: sectionDescription,
    links,
    setLinks,
  }: {
    title: string;
    description: string;
    links: EditorLink[];
    setLinks: React.Dispatch<React.SetStateAction<EditorLink[]>>;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-sm">{sectionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
              <Input
                value={item.labelKey}
                onChange={(e) =>
                  handleUpdateLink(setLinks, index, "labelKey", e.target.value)
                }
                placeholder="Key"
                className="font-mono text-xs"
              />
              <Input
                value={item.label}
                onChange={(e) =>
                  handleUpdateLink(setLinks, index, "label", e.target.value)
                }
                placeholder={`Label (${localeNames[locale]})`}
              />
              <Input
                value={item.href}
                onChange={(e) =>
                  handleUpdateLink(setLinks, index, "href", e.target.value)
                }
                placeholder="/path"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveLink(setLinks, index)}
              className="shrink-0 h-8 w-8"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddLink(setLinks)}
          className="gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Link
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Footer Description */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Description & Logo</CardTitle>
          <CardDescription>
            Main description text and logo shown in the footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setHasChanges(true);
            }}
            placeholder="Enter footer description"
            rows={3}
          />
          </div>
          <div className="space-y-2">
            <Label>Footer Logo</Label>
            <div className="space-y-3">
              {logo && (
                <div className="relative w-40 h-20 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={logo}
                    alt="Footer logo"
                    fill
                    className="object-contain"
                  />
                  <button
                    onClick={() => {
                      setLogo("");
                      setHasChanges(true);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <ImageUpload
                value={logo}
                onChange={(url) => {
                  setLogo(url);
                  setHasChanges(true);
                }}
                folder="sumud/branding"
                aspectRatio="16/9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LinkSection
          title="Quick Links"
          description="Main navigation links"
          links={quickLinks}
          setLinks={setQuickLinks}
        />
        <LinkSection
          title="Get Involved"
          description="Engagement links"
          links={getInvolvedLinks}
          setLinks={setGetInvolvedLinks}
        />
        <LinkSection
          title="Resources"
          description="Help and resource links"
          links={resourceLinks}
          setLinks={setResourceLinks}
        />
        <LinkSection
          title="Legal"
          description="Legal and policy links"
          links={legalLinks}
          setLinks={setLegalLinks}
        />
      </div>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Social media links displayed in the footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialLinks.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
            >
              <Input
                value={item.platform}
                onChange={(e) =>
                  handleUpdateSocialLink(index, "platform", e.target.value)
                }
                placeholder="Platform (e.g., Facebook)"
                className="w-40"
              />
              <Input
                value={item.url}
                onChange={(e) =>
                  handleUpdateSocialLink(index, "url", e.target.value)
                }
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSocialLink(index)}
                className="shrink-0 h-8 w-8"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSocialLink}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Social Link
          </Button>
        </CardContent>
      </Card>

      {/* Newsletter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Section</CardTitle>
          <CardDescription>
            Newsletter subscription text for {localeNames[locale]}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsletterTitle">Title</Label>
            <Input
              id="newsletterTitle"
              value={newsletterTitle}
              onChange={(e) => {
                setNewsletterTitle(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Newsletter title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newsletterSubtitle">Subtitle</Label>
            <Input
              id="newsletterSubtitle"
              value={newsletterSubtitle}
              onChange={(e) => {
                setNewsletterSubtitle(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Newsletter subtitle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Copyright */}
      <Card>
        <CardHeader>
          <CardTitle>Copyright Text</CardTitle>
          <CardDescription>Copyright notice displayed at the bottom</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={copyright}
            onChange={(e) => {
              setCopyright(e.target.value);
              setHasChanges(true);
            }}
            placeholder="© 2025 Your Company. All rights reserved."
          />
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Contact details displayed in the footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => {
                setContactEmail(e.target.value);
                setHasChanges(true);
              }}
              placeholder="info@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => {
                setContactPhone(e.target.value);
                setHasChanges(true);
              }}
              placeholder="+358 XX XXX XXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactLocation">Location</Label>
            <Input
              id="contactLocation"
              value={contactLocation}
              onChange={(e) => {
                setContactLocation(e.target.value);
                setHasChanges(true);
              }}
              placeholder="City, Country"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {hasChanges && (
          <span className="text-sm text-muted-foreground">Unsaved changes</span>
        )}
        <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Footer
        </Button>
      </div>
    </div>
  );
}
