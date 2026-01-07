"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Loader2, Languages } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
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
import { RichTextEditor } from "@/src/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ImageUpload } from "@/src/components/ui/image-upload";
import { Switch } from "@/src/components/ui/switch";

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  campaignType: z.enum(["awareness", "fundraising", "advocacy", "event"]).optional(),
  status: z.enum(["draft", "active", "paused", "completed", "cancelled", "archived"]),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  goal: z.number().optional(),
  isFeatured: z.boolean().optional(),
  language: z.enum(["en", "fi"]),
  autoTranslate: z.boolean(),
  callToAction: z.object({
    primary: z.object({
      text: z.string(),
      url: z.string().optional(),
      action: z.string().optional(),
    }).optional(),
    secondary: z.object({
      text: z.string(),
      url: z.string().optional(),
      action: z.string().optional(),
    }).optional(),
  }).optional(),
  targets: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    type: z.string().optional(),
    contact: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  demands: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
  })).optional(),
  howToParticipate: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    icon: z.string().optional(),
  })).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

interface Campaign {
  id?: string;
  title?: string;
  description?: string;
  campaignType?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  featuredImageUrl?: string;
  goal?: number;
  isFeatured?: boolean;
  callToAction?: {
    primary?: { text: string; url?: string; action?: string };
    secondary?: { text: string; url?: string; action?: string };
  };
  targets?: Array<{
    id?: string;
    name: string;
    type?: string;
    contact?: string;
    description?: string;
  }>;
  demands?: Array<{
    id?: string;
    title: string;
    description?: string;
    order?: number;
  }>;
  howToParticipate?: Array<{
    id?: string;
    title: string;
    description: string;
    order?: number;
    icon?: string;
  }>;
  seoTitle?: string;
  seoDescription?: string;
}

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
}

export function CampaignForm({
  campaign,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Campaign",
  submittingLabel = "Saving...",
}: CampaignFormProps) {
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: campaign?.title || "",
      description: campaign?.description || "",
      campaignType: campaign?.campaignType as CampaignFormData["campaignType"],
      category: campaign?.category || "",
      status: (campaign?.status as CampaignFormData["status"]) || "draft",
      startDate: campaign?.startDate || "",
      endDate: campaign?.endDate || "",
      featuredImageUrl: campaign?.featuredImageUrl || "",
      goal: campaign?.goal || undefined,
      isFeatured: campaign?.isFeatured || false,
      language: "en",
      autoTranslate: true,
      callToAction: campaign?.callToAction || { primary: undefined, secondary: undefined },
      targets: campaign?.targets || [],
      demands: campaign?.demands || [],
      howToParticipate: campaign?.howToParticipate || [],
      seoTitle: campaign?.seoTitle || "",
      seoDescription: campaign?.seoDescription || "",
    },
  });

  // Reset form when campaign changes
  React.useEffect(() => {
    if (campaign) {
      form.reset({
        title: campaign.title || "",
        description: campaign.description || "",
        campaignType: campaign.campaignType as CampaignFormData["campaignType"],
        category: campaign.category || "",
        status: (campaign.status as CampaignFormData["status"]) || "draft",
        startDate: campaign.startDate || "",
        endDate: campaign.endDate || "",
        featuredImageUrl: campaign.featuredImageUrl || "",
        goal: campaign.goal || undefined,
        isFeatured: campaign.isFeatured || false,
        language: "en",
        autoTranslate: true,
        callToAction: campaign.callToAction || { primary: undefined, secondary: undefined },
        targets: campaign.targets || [],
        demands: campaign.demands || [],
        howToParticipate: campaign.howToParticipate || [],
        seoTitle: campaign.seoTitle || "",
        seoDescription: campaign.seoDescription || "",
      });
    }
  }, [campaign, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter campaign title..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Describe your campaign..."
                          className="min-h-[200px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="campaignType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="awareness">Awareness</SelectItem>
                            <SelectItem value="fundraising">Fundraising</SelectItem>
                            <SelectItem value="advocacy">Advocacy</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Social Justice, Environment..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Amount (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter fundraising goal..."
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Set a fundraising goal if applicable.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
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
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Call To Action */}
            <Card>
              <CardHeader>
                <CardTitle>Call To Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-sm mb-3">Primary CTA</h3>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="callToAction.primary.text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Text</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Join Now, Donate, Learn More..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="callToAction.primary.url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-3">Secondary CTA (Optional)</h3>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="callToAction.secondary.text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Text</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Learn More, Share..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="callToAction.secondary.url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Targets */}
            <Card>
              <CardHeader>
                <CardTitle>Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormDescription>
                  Define the targets or recipients of your campaign demands.
                </FormDescription>
                <div className="space-y-3">
                  {form.watch("targets")?.map((_, index) => (
                    <div key={index} className="border rounded p-3 space-y-3">
                      <FormField
                        control={form.control}
                        name={`targets.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Government, Corporation..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`targets.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Government, Corporate..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`targets.${index}.contact`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Email or phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`targets.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Details about the target..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const targets = form.getValues("targets") || [];
                          form.setValue("targets", targets.filter((_, i) => i !== index));
                        }}
                      >
                        Remove Target
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const targets = form.getValues("targets") || [];
                    form.setValue("targets", [
                      ...targets,
                      { name: "", type: "", contact: "", description: "" },
                    ]);
                  }}
                >
                  Add Target
                </Button>
              </CardContent>
            </Card>

            {/* Demands */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Demands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormDescription>
                  List the key demands or goals of your campaign.
                </FormDescription>
                <div className="space-y-3">
                  {form.watch("demands")?.map((_, index) => (
                    <div key={index} className="border rounded p-3 space-y-3">
                      <FormField
                        control={form.control}
                        name={`demands.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Demand Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter demand..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`demands.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Details about this demand..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const demands = form.getValues("demands") || [];
                          form.setValue("demands", demands.filter((_, i) => i !== index));
                        }}
                      >
                        Remove Demand
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const demands = form.getValues("demands") || [];
                    form.setValue("demands", [
                      ...demands,
                      { title: "", description: "" },
                    ]);
                  }}
                >
                  Add Demand
                </Button>
              </CardContent>
            </Card>

            {/* How To Participate */}
            <Card>
              <CardHeader>
                <CardTitle>How To Participate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormDescription>
                  Guide participants on how to get involved in your campaign.
                </FormDescription>
                <div className="space-y-3">
                  {form.watch("howToParticipate")?.map((_, index) => (
                    <div key={index} className="border rounded p-3 space-y-3">
                      <FormField
                        control={form.control}
                        name={`howToParticipate.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Step Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Sign the Petition..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`howToParticipate.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="How to participate in this step..."
                                className="min-h-[80px]"
                                {...field}
                              />
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
                            <FormLabel>Icon Name (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., heart, star, share..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const howTo = form.getValues("howToParticipate") || [];
                          form.setValue("howToParticipate", howTo.filter((_, i) => i !== index));
                        }}
                      >
                        Remove Step
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const howTo = form.getValues("howToParticipate") || [];
                    form.setValue("howToParticipate", [
                      ...howTo,
                      { title: "", description: "", icon: "" },
                    ]);
                  }}
                >
                  Add Step
                </Button>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SEO optimized title (50-60 characters)..."
                          maxLength={60}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/60 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Meta description (150-160 characters)..."
                          maxLength={160}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/160 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fi">Suomi (Finnish)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Primary language for this campaign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoTranslate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          Auto-translate
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Automatically translate to {form.watch("language") === "en" ? "Finnish" : "English"}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Campaign</FormLabel>
                        <FormDescription>
                          Show on homepage
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col space-y-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#781D32] hover:bg-[#781D32]/90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting ? submittingLabel : submitLabel}
                  </Button>
                  {form.watch("autoTranslate") && (
                    <p className="text-xs text-muted-foreground text-center">
                      Will create versions in both languages
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
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
                          placeholder="https://example.com/image.jpg"
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
      </form>
    </Form>
  );
}
