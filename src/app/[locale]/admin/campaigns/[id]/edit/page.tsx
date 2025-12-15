"use client";

import * as React from "react";
import { useRouter, Link } from "@/src/i18n/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { ImageUpload } from "@/src/components/ui/image-upload";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Loader2, 
  Plus, 
  Trash2,
  Target,
  ListChecks,
  Users,
  FileText,
  Megaphone,
  Trophy,
  Settings,
  Languages
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { toast } from "sonner";
import { Campaign, CampaignTarget, CampaignDemand, CampaignResource, HowToParticipate, CallToAction, SuccessStory, transformCampaignToUI, CampaignWithTranslations } from "@/src/types/Campaigns";
import { updateCampaign, getCampaignById } from "@/src/actions/campaigns.actions";

// Validation schemas
const targetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  link: z.string().optional(),
});

const demandSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "achieved", "in_progress"]).optional(),
});

const resourceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["document", "image", "video", "link", "other"]),
  url: z.string().min(1, "URL is required"),
  description: z.string().optional(),
});

const howToParticipateSchema = z.object({
  id: z.string(),
  step: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const successStorySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().optional(),
  imageUrl: z.string().optional(),
});

const callToActionSchema = z.object({
  primaryText: z.string().optional(),
  primaryLink: z.string().optional(),
  secondaryText: z.string().optional(),
  secondaryLink: z.string().optional(),
});

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  slug: z.string().optional(),
  campaignType: z.enum(["awareness", "advocacy", "fundraising", "community_building", "education", "solidarity", "humanitarian", "political", "cultural", "environmental"]),
  status: z.enum(["draft", "active", "paused", "completed", "cancelled", "archived"]),
  isFeatured: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  iconName: z.string().optional(),
  goalAmount: z.number().optional(),
  raisedAmount: z.number().optional(),
  targets: z.array(targetSchema).optional(),
  demands: z.array(demandSchema).optional(),
  resources: z.array(resourceSchema).optional(),
  howToParticipate: z.array(howToParticipateSchema).optional(),
  callToAction: callToActionSchema.optional(),
  successStories: z.array(successStorySchema).optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface EditCampaignPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditCampaignPage = ({ params }: EditCampaignPageProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [campaignId, setCampaignId] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState("details");

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      slug: "",
      campaignType: "awareness",
      status: "draft",
      isFeatured: false,
      startDate: "",
      endDate: "",
      featuredImageUrl: "",
      iconName: "",
      goalAmount: 0,
      raisedAmount: 0,
      targets: [],
      demands: [],
      resources: [],
      howToParticipate: [],
      callToAction: {},
      successStories: [],
    },
  });

  // Field arrays for dynamic sections
  const { fields: targetFields, append: appendTarget, remove: removeTarget } = useFieldArray({
    control: form.control,
    name: "targets",
  });

  const { fields: demandFields, append: appendDemand, remove: removeDemand } = useFieldArray({
    control: form.control,
    name: "demands",
  });

  const { fields: resourceFields, append: appendResource, remove: removeResource } = useFieldArray({
    control: form.control,
    name: "resources",
  });

  const { fields: participateFields, append: appendParticipate, remove: removeParticipate } = useFieldArray({
    control: form.control,
    name: "howToParticipate",
  });

  const { fields: storyFields, append: appendStory, remove: removeStory } = useFieldArray({
    control: form.control,
    name: "successStories",
  });

  // Fetch campaign data
  React.useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);

        const resolvedParams = await params;
        const id = resolvedParams.id;
        setCampaignId(id);

        // Use server action directly instead of API route
        const { data: rawCampaign, error } = await getCampaignById(id);

        if (error || !rawCampaign) {
          throw new Error(error || "Campaign not found");
        }

        // Transform the data from snake_case to camelCase
        const campaignData = transformCampaignToUI(rawCampaign, "en");

        form.reset({
          title: campaignData.title || "",
          description: campaignData.description || "",
          shortDescription: campaignData.shortDescription || "",
          slug: campaignData.slug || "",
          campaignType: campaignData.campaignType || "awareness",
          status: campaignData.status || "draft",
          isFeatured: campaignData.isFeatured || false,
          startDate: campaignData.startDate?.split("T")[0] || "",
          endDate: campaignData.endDate?.split("T")[0] || "",
          featuredImageUrl: campaignData.featuredImageUrl || "",
          iconName: campaignData.iconName || "",
          goalAmount: campaignData.stats?.goalAmount || 0,
          raisedAmount: campaignData.stats?.raisedAmount || 0,
          targets: campaignData.targets || [],
          demands: campaignData.demands || [],
          resources: campaignData.resources || [],
          howToParticipate: campaignData.howToParticipate || [],
          callToAction: campaignData.callToAction || {},
          successStories: campaignData.successStories || [],
        });

        setCampaign(campaignData);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        toast.error("Failed to load campaign");
        router.push("/admin/campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [params, form, router]);

  // Form submit handler
  const onSubmit = async (data: CampaignFormData) => {
    if (!campaign) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        slug: data.slug || undefined,
        campaign_type: data.campaignType,
        status: data.status,
        is_featured: data.isFeatured,
        featured_image_url: data.featuredImageUrl || null,
        icon_name: data.iconName || null,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        stats: {
          goalAmount: data.goalAmount || 0,
          raisedAmount: data.raisedAmount || 0,
        },
        targets: data.targets || null,
        demands: data.demands || null,
        resources: data.resources || null,
        how_to_participate: data.howToParticipate || null,
        call_to_action: data.callToAction || null,
        success_stories: data.successStories || null,
      };

      const result = await updateCampaign(campaignId, updateData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Campaign updated successfully!");
      router.push(`/admin/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update campaign. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview handler
  const handlePreview = () => {
    if (!campaign || !campaignId) return;
    window.open(`/admin/campaigns/${campaignId}`, "_blank");
    toast.info("Opening campaign preview in new tab");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading campaign...</span>
      </div>
    );
  }

  // Not found state
  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Campaign Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The campaign you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/admin/campaigns">Back to Campaigns</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/campaigns/${campaignId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaign
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
            <p className="text-gray-600">Update campaign: {campaign.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-[#781D32] hover:bg-[#781D32]/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Form with Tabs */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 pb-2">
              <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-lg gap-1 min-w-max">
                <TabsTrigger 
                  value="details" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#781D32] transition-all"
                >
                  <Settings className="h-4 w-4" />
                  <span>Details</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="targets" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#781D32] transition-all"
                >
                  <Target className="h-4 w-4" />
                  <span>Targets</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="demands" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#781D32] transition-all"
                >
                  <ListChecks className="h-4 w-4" />
                  <span>Demands</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="participate" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#781D32] transition-all"
                >
                  <Users className="h-4 w-4" />
                  <span>Participate</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#781D32] transition-all"
                >
                  <FileText className="h-4 w-4" />
                  <span>Resources</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="cta" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#781D32] transition-all"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>Call to Action</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="stories" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#781D32] transition-all"
                >
                  <Trophy className="h-4 w-4" />
                  <span>Stories</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="translations" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#781D32] transition-all"
                >
                  <Languages className="h-4 w-4" />
                  <span>Translations</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Core campaign details and description</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Campaign title..." {...field} disabled />
                              </FormControl>
                              <FormDescription>Edit via Translations tab</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input placeholder="campaign-slug" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="shortDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief summary..."
                                className="min-h-[80px]"
                                {...field}
                                disabled
                              />
                            </FormControl>
                            <FormDescription>Edit via Translations tab</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed campaign description..."
                                className="min-h-[150px]"
                                {...field}
                                disabled
                              />
                            </FormControl>
                            <FormDescription>Edit via Translations tab</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Funding Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="goalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Goal Amount ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="10000"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="raisedAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Raised Amount ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campaignType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="awareness">Awareness</SelectItem>
                                <SelectItem value="advocacy">Advocacy</SelectItem>
                                <SelectItem value="fundraising">Fundraising</SelectItem>
                                <SelectItem value="community_building">Community Building</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="solidarity">Solidarity</SelectItem>
                                <SelectItem value="humanitarian">Humanitarian</SelectItem>
                                <SelectItem value="political">Political</SelectItem>
                                <SelectItem value="cultural">Cultural</SelectItem>
                                <SelectItem value="environmental">Environmental</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="iconName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon Name</FormLabel>
                            <FormControl>
                              <Input placeholder="megaphone" {...field} />
                            </FormControl>
                            <FormDescription>Lucide icon name</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Featured Image</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="featuredImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Image</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isSubmitting}
                                folder="campaigns"
                                maxSize={5}
                              />
                            </FormControl>
                            <FormDescription>
                              Upload an image or provide a URL below. Maximum size: 5MB.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featuredImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Or enter image URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://..."
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormDescription>
                              Alternatively, paste an image URL directly.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Targets Tab */}
            <TabsContent value="targets" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Campaign Targets</CardTitle>
                      <CardDescription>Companies, politicians, or entities to target</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendTarget({ id: crypto.randomUUID(), name: "", description: "", imageUrl: "", link: "" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Target
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {targetFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No targets added yet</p>
                      <p className="text-sm">Add companies, politicians, or entities to boycott or contact</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {targetFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Target {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTarget(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`targets.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Target name..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`targets.${index}.link`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Link (optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`targets.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Why this target..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`targets.${index}.imageUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Demands Tab */}
            <TabsContent value="demands" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Campaign Demands</CardTitle>
                      <CardDescription>What the campaign is demanding</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendDemand({ id: crypto.randomUUID(), title: "", description: "", status: "pending" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Demand
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {demandFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No demands added yet</p>
                      <p className="text-sm">Add the demands this campaign is making</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {demandFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Demand {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDemand(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`demands.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Demand title..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`demands.${index}.status`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="achieved">Achieved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`demands.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="More details..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* How to Participate Tab */}
            <TabsContent value="participate" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>How to Participate</CardTitle>
                      <CardDescription>Steps for supporters to get involved</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendParticipate({ 
                        id: crypto.randomUUID(), 
                        step: participateFields.length + 1, 
                        title: "", 
                        description: "", 
                        icon: "" 
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {participateFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No participation steps added yet</p>
                      <p className="text-sm">Add steps to guide supporters on how to participate</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {participateFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Step {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipate(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`howToParticipate.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Step title..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`howToParticipate.${index}.icon`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Icon (optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Lucide icon name..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`howToParticipate.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Detailed instructions..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Campaign Resources</CardTitle>
                      <CardDescription>Downloadable materials and useful links</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendResource({ id: crypto.randomUUID(), title: "", type: "link", url: "", description: "" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {resourceFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No resources added yet</p>
                      <p className="text-sm">Add documents, videos, or links for supporters</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {resourceFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Resource {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeResource(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`resources.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Resource title..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`resources.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="document">Document</SelectItem>
                                      <SelectItem value="image">Image</SelectItem>
                                      <SelectItem value="video">Video</SelectItem>
                                      <SelectItem value="link">Link</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`resources.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`resources.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="What is this resource..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Call to Action Tab */}
            <TabsContent value="cta" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Call to Action</CardTitle>
                  <CardDescription>Primary and secondary action buttons for the campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Primary Action</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="callToAction.primaryText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Take Action Now" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="callToAction.primaryLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Link</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Secondary Action</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="callToAction.secondaryText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Learn More" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="callToAction.secondaryLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Link</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Success Stories Tab */}
            <TabsContent value="stories" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Success Stories</CardTitle>
                      <CardDescription>Victories and achievements of the campaign</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendStory({ id: crypto.randomUUID(), title: "", description: "", date: "", imageUrl: "" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Story
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {storyFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No success stories added yet</p>
                      <p className="text-sm">Share victories and achievements from this campaign</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {storyFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Story {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStory(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`successStories.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Story title..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`successStories.${index}.date`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date (optional)</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`successStories.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Tell the story..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`successStories.${index}.imageUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Translations Tab */}
            <TabsContent value="translations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Translations</CardTitle>
                  <CardDescription>
                    Manage campaign translations for different languages. 
                    Visit the campaign details page for full translation management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Languages className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">
                      Translation management is available on the campaign details page.
                    </p>
                    <Button asChild variant="outline">
                      <Link href={`/admin/campaigns/${campaignId}`}>
                        Go to Campaign Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default EditCampaignPage;
