"use client"

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userProfileSchema } from "@/lib/validations/user";
import { PROFILE_CATEGORIES, getFieldsByCategory } from "@/lib/profile-fields";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function DynamicProfileForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<any>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: initialData || {},
  });

  async function onSubmit(values: any) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setMessage("Profile updated successfully!");
    } catch (error: any) {
      setMessage(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  const renderField = (field: any) => {
    const fieldKey = field.key;

    if (field.type === "object") {
      if (fieldKey === "address" || fieldKey === "mailingAddress") {
        return (
          <div key={fieldKey} className="space-y-4">
            <h4 className="font-medium text-sm">{field.label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              {["street", "apartment", "city", "state", "postalCode", "country"].map((subField) => (
                <FormField
                  key={`${fieldKey}.${subField}`}
                  control={form.control}
                  name={`${fieldKey}.${subField}`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{subField}</FormLabel>
                      <FormControl>
                        <Input {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        );
      }

      if (fieldKey === "emergencyContact" || fieldKey === "secondaryEmergencyContact") {
        return (
          <div key={fieldKey} className="space-y-4">
            <h4 className="font-medium text-sm">{field.label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              {["name", "phone", "relationship", "email"].map((subField) => (
                <FormField
                  key={`${fieldKey}.${subField}`}
                  control={form.control}
                  name={`${fieldKey}.${subField}`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{subField}</FormLabel>
                      <FormControl>
                        <Input {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        );
      }

      return null;
    }

    if (field.type === "array") {
      return (
        <FormField
          key={fieldKey}
          control={form.control}
          name={fieldKey}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter comma-separated values"
                  {...formField}
                  value={Array.isArray(formField.value) ? formField.value.join(", ") : formField.value || ""}
                  onChange={(e: any) => {
                    const values = e.target.value.split(",").map((v: any) => v.trim()).filter(Boolean);
                    formField.onChange(values);
                  }}
                />
              </FormControl>
              {field.description && <FormDescription>{field.description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return (
      <FormField
        key={fieldKey}
        control={form.control}
        name={fieldKey}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {field.type === "select" && field.options ? (
                <Select
                  {...formField}
                  disabled={fieldKey === "email"}
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </option>
                  ))}
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  placeholder={field.label}
                  {...formField}
                />
              ) : (
                <Input
                  type={field.type === "date" ? "date" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                  placeholder={field.label}
                  disabled={fieldKey === "email"}
                  {...formField}
                />
              )}
            </FormControl>
            {field.description && <FormDescription>{field.description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const categorizedFields = Object.entries(PROFILE_CATEGORIES).map(([key, categoryName]) => {
    const fields = getFieldsByCategory(categoryName);
    return { category: categoryName, fields };
  }).filter(cat => cat.fields.length > 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" className="w-full" defaultValue={["Basic Information"]}>
          {categorizedFields.map(({ category, fields }) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-lg font-semibold">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {fields.map(field => renderField(field))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </Button>

        {message && (
          <p className={`text-sm text-center ${message.includes("success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {message}
          </p>
        )}
      </form>
    </Form>
  );
}
