"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Clock, Loader2, Check } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

export function ApiSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API Key",
      key: "wha_live_sk_1234567890abcdef",
      createdAt: "2024-01-15",
      lastUsed: "2024-03-28",
    },
    {
      id: "2",
      name: "Development Key",
      key: "wha_test_sk_abcdef1234567890",
      createdAt: "2024-02-20",
      lastUsed: "2024-03-27",
    },
  ]);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `wha_live_sk_${Math.random().toString(36).substring(2, 18)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    setCreating(false);
    setCreateOpen(false);
    setShowKeys({ ...showKeys, [newKey.id]: true });
  };

  const handleDelete = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys({ ...showKeys, [id]: !showKeys[id] });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + "•".repeat(20);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key for accessing the API
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="bg-secondary border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Give your key a descriptive name to identify it later
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={creating || !newKeyName}>
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Key"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-secondary/30 p-4 mb-4 border border-border">
            <p className="text-sm text-muted-foreground">
              API keys are used to authenticate requests to the API. Keep your keys secure and never
              share them publicly. If a key is compromised, delete it immediately.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{apiKey.name}</p>
                    {apiKey.key.includes("test") && (
                      <Badge variant="outline" className="text-xs border-border">
                        Test
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleShowKey(apiKey.id)}
                    >
                      {showKeys[apiKey.id] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(apiKey.key, apiKey.id)}
                    >
                      {copiedKey === apiKey.id ? (
                        <Check className="h-3 w-3 text-primary" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created {apiKey.createdAt}
                    </span>
                    {apiKey.lastUsed && (
                      <span>Last used {apiKey.lastUsed}</span>
                    )}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Delete API Key</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{apiKey.name}"? This action cannot be undone
                        and any applications using this key will stop working.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(apiKey.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">API Documentation</CardTitle>
          <CardDescription>
            Learn how to integrate with our API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">Send Message</h4>
              <code className="text-xs font-mono text-muted-foreground block bg-background p-2 rounded overflow-x-auto">
                POST /api/v1/messages
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Send WhatsApp messages to contacts
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">Get Contacts</h4>
              <code className="text-xs font-mono text-muted-foreground block bg-background p-2 rounded overflow-x-auto">
                GET /api/v1/contacts
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Retrieve your contact list
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">Create Contact</h4>
              <code className="text-xs font-mono text-muted-foreground block bg-background p-2 rounded overflow-x-auto">
                POST /api/v1/contacts
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Add new contacts to your list
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">Trigger Flow</h4>
              <code className="text-xs font-mono text-muted-foreground block bg-background p-2 rounded overflow-x-auto">
                POST /api/v1/flows/:id/trigger
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Trigger an automation flow for a contact
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
