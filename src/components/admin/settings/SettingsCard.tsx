import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { SettingsCardProps } from "@/src/types/Settings";

const SettingsCard = ({ title, description, children }: SettingsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">{children}</CardContent>
  </Card>
);

export default SettingsCard;