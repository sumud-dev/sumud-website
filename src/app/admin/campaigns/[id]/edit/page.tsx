"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import { Campaign } from "@/src/types/Campaigns";

// Validation schema
const campaignSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  goal: z.number().min(1, "Goal must be greater than 0"),
  status: z.enum(["draft", "active", "paused", "completed", "cancelled"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
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

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: 0,
      status: "draft",
      startDate: "",
      endDate: "",
      imageUrl: "",
    },
  });

  // Fetch campaign data
  React.useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);

        const resolvedParams = await params;
        const id = resolvedParams.id;
        setCampaignId(id);

        const response = await fetch(`/api/campaigns/${id}`);

        if (!response.ok) {
          throw new Error("Campaign not found");
        }

        const data = await response.json();
        const campaignData = data.data;

        form.reset({
          title: campaignData.title || "",
          description: campaignData.description || "",
          goal: campaignData.goal || 0,
          status: campaignData.status || "draft",
          startDate: campaignData.startDate?.split("T")[0] || "",
          endDate: campaignData.endDate?.split("T")[0] || "",
          imageUrl: campaignData.imageUrl || "",
        });

        setCampaign(campaignData);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        toast.error("Failed to load campaign");
        router.push("/campaigns");
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
        title: data.title,
        description: data.description,
        goal: data.goal,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        imageUrl: data.imageUrl || null,
      };

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update campaign");
      }

      toast.success("Campaign updated successfully!");
      router.push("/campaigns");
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
    window.open(`/campaigns/${campaignId}`, "_blank");
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
          <Link href="/campaigns">Back to Campaigns</Link>
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
            <Link href="/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
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
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
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
                          <Textarea
                            placeholder="Describe your campaign..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your campaign goals and purpose.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Goal ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          The target amount you want to raise.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Dates */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Duration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Status</FormLabel>
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col space-y-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#781D32] hover:bg-[#781D32]/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Updating..." : "Update Campaign"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Amount</span>
                      <span className="font-semibold">
                        ${campaign.currentAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Goal</span>
                      <span className="font-semibold">
                        ${campaign.goal?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-[#781D32] h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((campaign.currentAmount || 0) / (campaign.goal || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      {Math.round(
                        ((campaign.currentAmount || 0) / (campaign.goal || 1)) * 100
                      )}
                      % funded
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        {campaign.imageUrl && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-1">
                              Current image:
                            </p>
                            <Image
                              src={campaign.imageUrl}
                              alt="Campaign image"
                              width={400}
                              height={128}
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}
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
    </div>
  );
};

export default EditCampaignPage;
