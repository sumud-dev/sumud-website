"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Loader2, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { RichTextEditor } from "@/src/lib/tipTap-editor/RichTextEditor";
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
  autoTranslate: z.boolean().optional(),
  callToAction: z.object({
    primary: z.object({
      text: z.string().optional(),
      url: z.string().optional(),
      action: z.string().optional(),
    }).optional(),
    secondary: z.object({
      text: z.string().optional(),
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
  const t = useTranslations("admin.campaigns.form");
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
      autoTranslate: !campaign ? true : undefined,
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
        autoTranslate: !campaign ? true : undefined,
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
                <CardTitle>{t("campaignDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("title")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("titlePlaceholder")}
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
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t("descriptionPlaceholder")}
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
                        <FormLabel>{t("campaignType")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectType")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="awareness">{t("awareness")}</SelectItem>
                            <SelectItem value="fundraising">{t("fundraising")}</SelectItem>
                            <SelectItem value="advocacy">{t("advocacy")}</SelectItem>
                            <SelectItem value="event">{t("event")}</SelectItem>
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
                        <FormLabel>{t("category")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("categoryPlaceholder")}
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
                      <FormLabel>{t("goal")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("goalPlaceholder")}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("goalDescription")}
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
                <CardTitle>{t("timeline")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("startDate")}</FormLabel>
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
                        <FormLabel>{t("endDate")}</FormLabel>
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
                <CardTitle>{t("callToAction")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-sm mb-3">{t("primaryCTA")}</h3>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="callToAction.primary.text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("buttonText")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("ctaPlaceholder")}
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
                              placeholder={t("urlPlaceholder")}
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
                  <h3 className="font-semibold text-sm mb-3">{t("secondaryCTA")}</h3>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="callToAction.secondary.text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("buttonText")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("secondaryCtaPlaceholder")}
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
                              placeholder={t("urlPlaceholder")}
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
                <CardTitle>{t("targets")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormDescription>
                  {t("targetsDescription")}
                </FormDescription>
                <div className="space-y-3">
                  {form.watch("targets")?.map((_, index) => (
                    <div key={index} className="border rounded p-3 space-y-3">
                      <FormField
                        control={form.control}
                        name={`targets.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("targetName")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("targetNamePlaceholder")}
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
                            <FormLabel>{t("targetType")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("targetTypePlaceholder")}
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
                            <FormLabel>{t("targetContact")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("targetContactPlaceholder")}
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
                            <FormLabel>{t("targetDescription")}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("targetDescriptionPlaceholder")}
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
                        {t("removeTarget")}
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
                  {t("addTarget")}
                </Button>
              </CardContent>
            </Card>

            {/* Demands */}
            <Card>
              <CardHeader>
                <CardTitle>{t("campaignDemands")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormDescription>
                  {t("demandsDescription")}
                </FormDescription>
                <div className="space-y-3">
                  {form.watch("demands")?.map((_, index) => (
                    <div key={index} className="border rounded p-3 space-y-3">
                      <FormField
                        control={form.control}
                        name={`demands.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("demandTitle")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("demandTitlePlaceholder")}
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
                            <FormLabel>{t("demandDescription")}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("demandDescriptionPlaceholder")}
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
                        {t("removeDemand")}
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
                  {t("addDemand")}
                </Button>
              </CardContent>
            </Card>

            {/* How To Participate */}
            <Card>
              <CardHeader>
                <CardTitle>{t("howToParticipate")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormDescription>
                  {t("howToParticipateDescription")}
                </FormDescription>
                <div className="space-y-3">
                  {form.watch("howToParticipate")?.map((_, index) => (
                    <div key={index} className="border rounded p-3 space-y-3">
                      <FormField
                        control={form.control}
                        name={`howToParticipate.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("stepTitle")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("stepTitlePlaceholder")}
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
                            <FormLabel>{t("stepDescription")}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("stepDescriptionPlaceholder")}
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
                            <FormLabel>{t("iconName")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("iconNamePlaceholder")}
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
                        {t("removeStep")}
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
                  {t("addStep")}
                </Button>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>{t("seoSettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("seoTitle")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("seoTitlePlaceholder")}
                          maxLength={60}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("charactersCount", { current: field.value?.length || 0, max: 60 })}
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
                      <FormLabel>{t("seoDescription")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("seoDescriptionPlaceholder")}
                          maxLength={160}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("charactersCount", { current: field.value?.length || 0, max: 160 })}
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
                <CardTitle>{t("publishing")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("language")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectLanguage")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">{t("english")}</SelectItem>
                          <SelectItem value="fi">{t("finnish")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t("primaryLanguageDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!campaign && (
                  <FormField
                    control={form.control}
                    name="autoTranslate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            {t("autoTranslate")}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {t("autoTranslateDescription", { language: form.watch("language") === "en" ? t("finnish") : t("english") })}
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
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("status")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectStatus")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">{t("statusDraft")}</SelectItem>
                          <SelectItem value="active">{t("statusActive")}</SelectItem>
                          <SelectItem value="paused">{t("statusPaused")}</SelectItem>
                          <SelectItem value="completed">{t("statusCompleted")}</SelectItem>
                          <SelectItem value="cancelled">{t("statusCancelled")}</SelectItem>
                          <SelectItem value="archived">{t("statusArchived")}</SelectItem>
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
                        <FormLabel>{t("isFeatured")}</FormLabel>
                        <FormDescription>
                          {t("showOnHomepage")}
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
                  {!campaign && form.watch("autoTranslate") && (
                    <p className="text-xs text-muted-foreground text-center">
                      {t("createBothLanguages")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>{t("featuredImage")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="featuredImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("campaignImage")}</FormLabel>
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
                        {t("campaignImageDescription")}
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
                      <FormLabel>{t("orEnterImageUrl")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("imageUrlPlaceholder")}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("imageUrlDescription")}
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
