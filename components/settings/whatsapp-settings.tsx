"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
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
  Smartphone,
  Zap,
  Settings2,
  Trash2,
} from "lucide-react";

// Declare FB SDK types
declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: {
            code?: string;
            accessToken?: string;
          };
          status: string;
        }) => void,
        options: {
          config_id: string;
          response_type: string;
          override_default_response_type: boolean;
          extras: {
            setup: Record<string, unknown>;
            featureType: string;
            sessionInfoVersion: string;
          };
        }
      ) => void;
    };
    fbAsyncInit: () => void;
  }
}

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  phoneNumberId: string;
  wabaId: string;
  displayName: string;
  status: string;
}

export function WhatsAppSettings() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);
  const [settings, setSettings] = useState({
    phoneNumber: "",
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    webhookVerifyToken: "",
    displayName: "",
    autoReply: true,
    businessHoursOnly: false,
    readReceipts: true,
  });

  // Load Facebook SDK
  useEffect(() => {
    const loadFacebookSDK = () => {
      if (document.getElementById("facebook-jssdk")) {
        setFbSdkLoaded(true);
        return;
      }

      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });
        setFbSdkLoaded(true);
      };

      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    loadFacebookSDK();
  }, []);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings/whatsapp");
        const data = await response.json();

        if (data.connected && data.config) {
          setConnected(true);
          setSettings((prev) => ({
            ...prev,
            phoneNumber: data.config.phoneNumber || "",
            phoneNumberId: data.config.phoneNumberId || "",
            wabaId: data.config.wabaId || "",
            displayName: data.config.displayName || "",
          }));
        }

        if (data.accounts) {
          setAccounts(data.accounts);
        }
      } catch (error) {
        console.error("Error loading WhatsApp settings:", error);
        toast.error("Failed to load WhatsApp settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle Embedded Signup callback
  const handleEmbeddedSignupCallback = useCallback(
    async (code: string) => {
      setConnecting(true);
      try {
        const response = await fetch("/api/auth/whatsapp-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (response.ok) {
          setConnected(true);
          toast.success("WhatsApp account connected successfully!");

          // Reload settings to get the new account
          const settingsResponse = await fetch("/api/settings/whatsapp");
          const settingsData = await settingsResponse.json();

          if (settingsData.config) {
            setSettings((prev) => ({
              ...prev,
              phoneNumber: settingsData.config.phoneNumber || "",
              phoneNumberId: settingsData.config.phoneNumberId || "",
              wabaId: settingsData.config.wabaId || "",
              displayName: settingsData.config.displayName || "",
            }));
          }

          if (settingsData.accounts) {
            setAccounts(settingsData.accounts);
          }
        } else {
          toast.error(data.error || "Failed to connect WhatsApp account");
        }
      } catch (error) {
        console.error("Error during WhatsApp callback:", error);
        toast.error("Failed to connect WhatsApp account");
      } finally {
        setConnecting(false);
      }
    },
    []
  );

  // Launch Embedded Signup
  const launchEmbeddedSignup = () => {
    if (!fbSdkLoaded || !window.FB) {
      toast.error("Facebook SDK not loaded. Please refresh the page.");
      return;
    }

    const configId = process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID;
    if (!configId) {
      toast.error("WhatsApp configuration not set up. Please contact support.");
      return;
    }

    setConnecting(true);

    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          handleEmbeddedSignupCallback(response.authResponse.code);
        } else {
          setConnecting(false);
          if (response.status !== "unknown") {
            toast.error("Failed to authorize WhatsApp. Please try again.");
          }
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "2",
        },
      }
    );
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/settings/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: settings.phoneNumber,
          phoneNumberId: settings.phoneNumberId,
          wabaId: settings.wabaId,
          accessToken: settings.accessToken,
          webhookVerifyToken: settings.webhookVerifyToken,
          displayName: settings.displayName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setConnected(true);
        toast.success("WhatsApp settings saved successfully!");
      } else {
        toast.error(data.error || "Failed to save WhatsApp settings");
      }
    } catch (error) {
      console.error("Error saving WhatsApp settings:", error);
      toast.error("Failed to save WhatsApp settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.phoneNumberId || !settings.accessToken) {
      toast.error(
        "Phone Number ID and Access Token are required to test connection"
      );
      return;
    }

    setTesting(true);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${settings.phoneNumberId}?access_token=${settings.accessToken}`
      );

      if (response.ok) {
        toast.success("WhatsApp connection test successful!");
        setConnected(true);
      } else {
        const errorData = await response.json();
        toast.error(
          `WhatsApp connection test failed: ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error testing WhatsApp connection:", error);
      toast.error("Failed to test WhatsApp connection");
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this WhatsApp account?")) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/whatsapp/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAccounts(accounts.filter((a) => a.id !== accountId));
        if (accounts.length <= 1) {
          setConnected(false);
        }
        toast.success("WhatsApp account disconnected");
      } else {
        toast.error("Failed to disconnect account");
      }
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast.error("Failed to disconnect account");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Quick Connect Card */}
      <Card className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                <MessageSquare className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-foreground">
                  Connect WhatsApp Business
                </CardTitle>
                <CardDescription>
                  Connect your WhatsApp Business account in one click
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={connected ? "default" : "secondary"}
              className={
                connected ? "bg-green-500 text-white" : ""
              }
            >
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
          {!connected ? (
            <>
              <p className="text-sm text-muted-foreground">
                Click the button below to securely connect your WhatsApp Business
                account. You&apos;ll be guided through Meta&apos;s authorization process.
              </p>
              <Button
                onClick={launchEmbeddedSignup}
                disabled={connecting || !fbSdkLoaded}
                className="w-fit bg-green-500 hover:bg-green-600 text-white"
                size="lg"
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Connect with WhatsApp
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Your WhatsApp Business account is connected and ready to use.
              </p>

              {/* Connected Accounts List */}
              {accounts.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <Label className="text-sm font-medium">Connected Accounts</Label>
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {account.displayName || account.phoneNumber}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {account.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            account.status === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {account.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDisconnect(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={launchEmbeddedSignup}
                disabled={connecting || !fbSdkLoaded}
                variant="outline"
                className="w-fit mt-2"
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Add Another Number
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Settings */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Key className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="flex flex-col gap-6 mt-6">
          {/* Message Settings */}
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
                  <p className="font-medium text-foreground">
                    Business Hours Only
                  </p>
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

          {/* Webhook Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Key className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Your webhook endpoint for Meta
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${
                      typeof window !== "undefined" ? window.location.origin : ""
                    }/api/webhooks/whatsapp`}
                    className="bg-secondary border-border font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    className="border-border bg-transparent"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/api/webhooks/whatsapp`
                      );
                      toast.success("Webhook URL copied to clipboard!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This URL is automatically configured when you connect via
                  Embedded Signup
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="flex flex-col gap-6 mt-6">
          {/* Manual Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings2 className="h-5 w-5" />
                Manual Configuration
              </CardTitle>
              <CardDescription>
                Advanced settings for manual WhatsApp API setup
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-lg bg-yellow-500/10 p-4 border border-yellow-500/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Only use manual configuration if Embedded Signup doesn&apos;t work
                  for your use case. Most users should use the &quot;Connect with
                  WhatsApp&quot; button above.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phoneNumber">Display Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter your WhatsApp number (e.g., +1234567890)"
                    value={settings.phoneNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, phoneNumber: e.target.value })
                    }
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder="Enter your Phone Number ID"
                    value={settings.phoneNumberId}
                    onChange={(e) =>
                      setSettings({ ...settings, phoneNumberId: e.target.value })
                    }
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="wabaId">WABA ID</Label>
                  <Input
                    id="wabaId"
                    placeholder="Enter your WhatsApp Business Account ID"
                    value={settings.wabaId}
                    onChange={(e) =>
                      setSettings({ ...settings, wabaId: e.target.value })
                    }
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter your WhatsApp display name"
                    value={settings.displayName}
                    onChange={(e) =>
                      setSettings({ ...settings, displayName: e.target.value })
                    }
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
                  onChange={(e) =>
                    setSettings({ ...settings, accessToken: e.target.value })
                  }
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  This token is stored securely and used to authenticate API
                  requests
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
                <Input
                  id="webhookVerifyToken"
                  placeholder="Create a verify token for webhooks"
                  value={settings.webhookVerifyToken}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      webhookVerifyToken: e.target.value,
                    })
                  }
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Use this token when configuring webhooks in Meta Developer
                  Console
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={
                    testing || !settings.phoneNumberId || !settings.accessToken
                  }
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

          {/* Documentation Links */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ExternalLink className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                WhatsApp Cloud API Documentation{" "}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://developers.facebook.com/docs/whatsapp/embedded-signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Embedded Signup Documentation{" "}
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || loading}>
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
