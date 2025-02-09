"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...values, timestamp: new Date().toISOString() })
      });

      // Handle common HTTP errors with friendly messages
      if (response.status === 404) {
        throw new Error("Contact form service is temporarily unavailable. Please try again later.");
      }

      if (response.status === 429) {
        throw new Error("Too many requests. Please wait a moment before trying again.");
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // Handle non-JSON responses with a user-friendly message
        if (!response.ok) {
          console.error("Parse error:", parseError);
          throw new Error(
            response.status === 500
              ? "Server error. Please try again later."
              : "Unable to send message. Please try again."
          );
        }
        throw new Error("Unable to process server response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(
          data.error || 
          "Unable to send message. Please check your input and try again."
        );
      }

      toast({
        title: "Message Sent",
        description: "Thanks for reaching out! I'll get back to you soon.",
        variant: "default",
      });
      form.reset();
    } catch (error: any) {
      // Log the full error for debugging
      console.error("Contact form error:", error);
      
      // Show a user-friendly error message
      toast({
        title: "Unable to Send",
        description: error.message || "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto mt-14 flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Me</CardTitle>
          <CardDescription>Send me a message and I&apos;ll get back to you as soon as possible.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Your message here..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
