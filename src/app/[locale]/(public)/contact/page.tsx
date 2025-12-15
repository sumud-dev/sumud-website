"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
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
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required").max(1000, "Message too long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email",
    value: "info@sumud.fi",
    href: "mailto:info@sumud.fi",
    color: "bg-[#781D32]",
  },
  {
    icon: Phone,
    title: "Phone",
    description: "Call us directly",
    value: "+358 50 123 4567",
    href: "tel:+358501234567",
    color: "bg-[#55613C]",
  },
  {
    icon: MapPin,
    title: "Address",
    description: "Visit our office",
    value: "Helsinki, Finland",
    href: "#",
    color: "bg-[#3E442B]",
  },
];

export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = React.useState<SubmitStatus>("idle");

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        form.reset();
        toast.success("Message sent successfully!");
        // Clear success status after 5 seconds
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setSubmitStatus("error");
      toast.error("Failed to send message. Please try again.");
      // Clear error status after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#F4F3F0] to-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Badge className="mb-4 bg-[#781D32]/10 text-[#781D32] border-[#781D32]/20">
              Contact Us
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              We're here to listen, support, and work together for Palestinian solidarity.
              Reach out to us through any of the channels below.
            </p>
          </motion.div>

          {/* Contact Methods Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full text-center border-2 border-transparent hover:border-[#55613C]/20 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <method.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3E442B] mb-2">
                      {method.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <a
                      href={method.href}
                      className="text-[#781D32] hover:text-[#781D32]/80 font-medium transition-colors"
                    >
                      {method.value}
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-[#3E442B]">
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-lg">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Status Alerts */}
                {submitStatus === "success" && (
                  <Alert className="mb-6">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Message sent!</AlertTitle>
                    <AlertDescription>
                      Thank you for your message. We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to send message. Please try again or contact us directly.
                    </AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3E442B] font-medium">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              disabled={submitStatus === "submitting"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3E442B] font-medium">
                            Email Address *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              disabled={submitStatus === "submitting"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone Field */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3E442B] font-medium">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+358 50 123 4567 (optional)"
                              disabled={submitStatus === "submitting"}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional - we'll use this for urgent matters only
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Message Field */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3E442B] font-medium">
                            Message *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us how we can help you or what you'd like to discuss..."
                              className="min-h-32"
                              disabled={submitStatus === "submitting"}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum 1000 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-[#781D32] hover:bg-[#781D32]/90 text-white font-semibold py-3 text-lg"
                      disabled={submitStatus === "submitting"}
                      size="lg"
                    >
                      {submitStatus === "submitting" ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Office Hours */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3E442B]">
                    <Clock className="mr-3 h-6 w-6 text-[#781D32]" />
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="font-medium">10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="font-medium">Closed</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    * Times are in Finnish timezone (EET/EEST)
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Response Time */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3E442B]">
                    <Mail className="mr-3 h-6 w-6 text-[#781D32]" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-[#3E442B]">Email Inquiries</h4>
                      <p className="text-gray-600">Usually within 24 hours</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E442B]">Phone Calls</h4>
                      <p className="text-gray-600">During office hours only</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E442B]">Urgent Matters</h4>
                      <p className="text-gray-600">
                        For urgent solidarity actions or media inquiries, call directly
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}