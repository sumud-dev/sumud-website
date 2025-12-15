"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Heart,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";

// Zod validation schema
const volunteerFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  role: z.string().min(1, "Please select a volunteer role"),
  availability: z.string().min(1, "Please select your availability"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  motivation: z
    .string()
    .min(
      50,
      "Please tell us more about your motivation (at least 50 characters)",
    )
    .max(1000, "Motivation message is too long (max 1000 characters)"),
  experience: z.string().optional(),
});

type VolunteerFormData = z.infer<typeof volunteerFormSchema>;

interface VolunteerApplicationFormProps {
  onSuccess?: () => void;
  preselectedRole?: string;
}

const availabilityOptions = [
  { value: "2-5", label: "2-5 hours per week" },
  { value: "5-10", label: "5-10 hours per week" },
  { value: "10-15", label: "10-15 hours per week" },
  { value: "15+", label: "15+ hours per week" },
  { value: "flexible", label: "Flexible availability" },
];

const skillOptions = [
  { value: "communication", label: "Communication" },
  { value: "social-media", label: "Social Media" },
  { value: "writing", label: "Writing" },
  { value: "design", label: "Design" },
  { value: "video-editing", label: "Video Editing" },
  { value: "photography", label: "Photography" },
  { value: "translation", label: "Translation (FI/AR/EN)" },
  { value: "event-planning", label: "Event Planning" },
  { value: "public-speaking", label: "Public Speaking" },
  { value: "web-development", label: "Web Development" },
  { value: "data-analysis", label: "Data Analysis" },
  { value: "fundraising", label: "Fundraising" },
];

const volunteerRoles = [
  { value: "advocacy", label: "Advocacy & Outreach" },
  { value: "content", label: "Content Creation" },
  { value: "social-media", label: "Social Media Management" },
  { value: "events", label: "Event Coordination" },
  { value: "translation", label: "Translation Services" },
  { value: "tech", label: "Tech & Development" },
];

export default function VolunteerApplicationForm({
  onSuccess,
  preselectedRole,
}: VolunteerApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      role: preselectedRole || "",
      skills: [],
    },
  });

  const roleValue = watch("role");
  const availabilityValue = watch("availability");

  const onSubmit = async (_data: VolunteerFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Replace with actual API call
      // _data will be sent to API endpoint: POST /api/volunteers/applications

      setIsSuccess(true);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (_error) {
      // Error handling will be implemented with toast notifications
      // when backend API is ready
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillToggle = (skillValue: string) => {
    const newSkills = selectedSkills.includes(skillValue)
      ? selectedSkills.filter((s) => s !== skillValue)
      : [...selectedSkills, skillValue];

    setSelectedSkills(newSkills);
    setValue("skills", newSkills, { shouldValidate: true });
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-[#55613C] to-[#3E442B] rounded-full flex items-center justify-center mx-auto mb-6 glass-medium shadow-glass-lg">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-[#3E442B] mb-3">
          Application Submitted Successfully!
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Thank you for your interest in volunteering with Sumud! We&apos;ll
          review your application and get back to you within 3-5 business days.
        </p>
        <div className="glass-cream blur-transition border-glass-glow rounded-xl p-4 max-w-md mx-auto">
          <p className="text-sm text-[#3E442B]">
            <Heart className="inline h-4 w-4 text-[#781D32] mr-1" />
            Check your email for confirmation and next steps.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information Section */}
      <div className="glass-subtle blur-transition border-glass-glow rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-[#781D32]" />
          <h3 className="text-lg font-semibold text-[#3E442B]">
            Personal Information
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-[#781D32]">*</span>
            </Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder="John"
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-[#781D32]">*</span>
            </Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder="Doe"
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-[#781D32]">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john.doe@example.com"
              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+358 40 123 4567"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Volunteer Role & Availability */}
      <div className="glass-subtle blur-transition border-glass-glow rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#781D32]" />
          <h3 className="text-lg font-semibold text-[#3E442B]">
            Role & Availability
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">
            Preferred Volunteer Role <span className="text-[#781D32]">*</span>
          </Label>
          <Select
            value={roleValue}
            onValueChange={(value) =>
              setValue("role", value, { shouldValidate: true })
            }
          >
            <SelectTrigger
              id="role"
              className={`w-full ${errors.role ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select a volunteer role" />
            </SelectTrigger>
            <SelectContent>
              {volunteerRoles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">
            Time Commitment <span className="text-[#781D32]">*</span>
          </Label>
          <Select
            value={availabilityValue}
            onValueChange={(value) =>
              setValue("availability", value, { shouldValidate: true })
            }
          >
            <SelectTrigger
              id="availability"
              className={`w-full ${errors.availability ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select your availability" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#55613C]" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.availability && (
            <p className="text-sm text-red-600">
              {errors.availability.message}
            </p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="glass-subtle blur-transition border-glass-glow rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#781D32]" />
          <h3 className="text-lg font-semibold text-[#3E442B]">
            Skills & Experience
          </h3>
        </div>

        <div className="space-y-2">
          <Label>
            Your Skills <span className="text-[#781D32]">*</span>
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Select all skills that apply to you
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {skillOptions.map((skill) => (
              <div
                key={skill.value}
                className="flex items-center space-x-2 glass-cream blur-transition border-glass-glow rounded-lg p-3 hover:glass-medium cursor-pointer"
                onClick={() => handleSkillToggle(skill.value)}
              >
                <Checkbox
                  id={skill.value}
                  checked={selectedSkills.includes(skill.value)}
                  onCheckedChange={() => handleSkillToggle(skill.value)}
                />
                <Label
                  htmlFor={skill.value}
                  className="cursor-pointer flex-1 text-sm font-normal"
                >
                  {skill.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.skills && (
            <p className="text-sm text-red-600">{errors.skills.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">
            Previous Volunteer Experience (Optional)
          </Label>
          <Textarea
            id="experience"
            {...register("experience")}
            placeholder="Tell us about any previous volunteer work or relevant experience..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* Motivation Section */}
      <div className="glass-subtle blur-transition border-glass-glow rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-[#781D32]" />
          <h3 className="text-lg font-semibold text-[#3E442B]">
            Your Motivation
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivation">
            Why do you want to volunteer with Sumud?{" "}
            <span className="text-[#781D32]">*</span>
          </Label>
          <Textarea
            id="motivation"
            {...register("motivation")}
            placeholder="Share your passion for Palestinian solidarity and what motivates you to contribute to our cause..."
            rows={5}
            className={`resize-none ${errors.motivation ? "border-red-500" : ""}`}
          />
          {errors.motivation && (
            <p className="text-sm text-red-600">{errors.motivation.message}</p>
          )}
          <p className="text-xs text-gray-500">Minimum 50 characters</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-[#781D32] hover:bg-[#781D32]/90 text-white font-semibold shadow-glass-lg hover:shadow-glass-xl rounded-full h-12"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>
              <Heart className="mr-2 h-5 w-5" />
              Submit Application
            </>
          )}
        </Button>
      </div>

      {/* Privacy Notice */}
      <div className="glass-cream blur-transition border-glass-glow rounded-lg p-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          By submitting this form, you agree to our volunteer privacy policy. We
          will use your information solely for volunteer coordination purposes
          and will not share it with third parties without your consent.
        </p>
      </div>
    </form>
  );
}
