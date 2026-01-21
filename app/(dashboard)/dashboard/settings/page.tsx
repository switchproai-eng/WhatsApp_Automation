"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/general-settings";
import { WhatsAppSettings } from "@/components/settings/whatsapp-settings";
import { TeamSettings } from "@/components/settings/team-settings";
import { BillingSettings } from "@/components/settings/billing-settings";
import { ApiSettings } from "@/components/settings/api-settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organization settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <WhatsAppSettings />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamSettings />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingSettings />
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <ApiSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
