"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  Phone, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Save,
  Loader2,
  Smartphone
} from "lucide-react";

export function WhatsAppSettings() {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState({
    phoneNumberId: "",
    businessAccountId: "",
    accessToken: "",
    webhookVerifyToken: "",
    autoReply: true,
    businessHoursOnly: false,
    readReceipts: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnected(true);
    setSaving(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTesting(false);
    setConnected(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">WhatsApp Business API</CardTitle>
                <CardDescription>
                  Connect your WhatsApp Business account
                </CardDescription>
              </div>
            </div>
            <Badge variant={connected ? "default" : "secondary"} className={connected ? "bg-primary text-primary-foreground" : ""}>
              {connected ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-secondary/50 p-4 border border-border">
            <p className="text-sm text-muted-foreground">
              To connect WhatsApp Business API, you need a Meta Business account with WhatsApp Business API access.
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline inline-flex items-center gap-1"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                placeholder="Enter your Phone Number ID"
                value={settings.phoneNumberId}
                onChange={(e) => setSettings({ ...settings, phoneNumberId: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="businessAccountId">Business Account ID</Label>
              <Input
                id="businessAccountId"
                placeholder="Enter your Business Account ID"
                value={settings.businessAccountId}
                onChange={(e) => setSettings({ ...settings, businessAccountId: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Enter your permanent access token"
              value={settings.accessToken}
              onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
            <Input
              id="webhookVerifyToken"
              placeholder="Create a verify token for webhooks"
              value={settings.webhookVerifyToken}
              onChange={(e) => setSettings({ ...settings, webhookVerifyToken: e.target.value })}
              className="bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground">
              Use this token when configuring webhooks in Meta Developer Console
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !settings.phoneNumberId || !settings.accessToken}
              className="border-border bg-transparent"
            >
              {testing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Smartphone className="h-5 w-5" />
            Message Settings
          </CardTitle>
          <CardDescription>
            Configure how messages are handled
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Auto Reply</p>
              <p className="text-sm text-muted-foreground">
                Automatically respond to incoming messages
              </p>
            </div>
            <Switch
              checked={settings.autoReply}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoReply: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Business Hours Only</p>
              <p className="text-sm text-muted-foreground">
                Only send automated replies during business hours
              </p>
            </div>
            <Switch
              checked={settings.businessHoursOnly}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, businessHoursOnly: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Read Receipts</p>
              <p className="text-sm text-muted-foreground">
                Mark messages as read when viewed
              </p>
            </div>
            <Switch
              checked={settings.readReceipts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, readReceipts: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Key className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure your Meta webhook endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/whatsapp`}
                className="bg-secondary border-border font-mono text-sm"
              />
              <Button
                variant="outline"
                className="border-border bg-transparent"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/whatsapp`);
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add this URL to your Meta App webhook configuration
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
