"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import NewsletterSignup from "@/src/components/ui/newsletter-signup";

interface NewsletterSectionProps {
  variant?: "default" | "compact";
}

const defaultProps: NewsletterSectionProps = {
  variant: "default",
};

export const NewsletterSection = (props:NewsletterSectionProps) => {
  const { variant } = props;

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`py-20 bg-[#3E442B] ${selected ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewsletterSignup variant={variant} />
      </div>
    </section>
  );
};

export const NewsletterSectionSettings = () => {
  const {
    actions: { setProp },
    variant,
  } = useNode((node) => ({
    variant: node.data?.props?.variant,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label>Variant</Label>
        <Select
          value={variant}
          onValueChange={(value) =>
            setProp((props: NewsletterSectionProps) => (props.variant = value as "default" | "compact"))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

NewsletterSection.craft = {
  displayName: "Newsletter Section",
  props: defaultProps,
  related: {
    settings: NewsletterSectionSettings,
  },
};
