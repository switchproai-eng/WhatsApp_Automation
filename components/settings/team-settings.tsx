"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, UserPlus, MoreHorizontal, Mail, Shield, Trash2, Loader2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "agent";
  status: "active" | "pending";
  joinedAt: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@acme.com",
    role: "owner",
    status: "active",
    joinedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@acme.com",
    role: "admin",
    status: "active",
    joinedAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike@acme.com",
    role: "agent",
    status: "active",
    joinedAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@acme.com",
    role: "agent",
    status: "pending",
    joinedAt: "2024-03-25",
  },
];

export function TeamSettings() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "agent" });

  const handleInvite = async () => {
    setInviting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteForm.email.split("@")[0],
      email: inviteForm.email,
      role: inviteForm.role as "admin" | "agent",
      status: "pending",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteForm({ email: "", role: "agent" });
    setInviting(false);
    setInviteOpen(false);
  };

  const handleRemove = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setTeamMembers(
      teamMembers.map((m) =>
        m.id === id ? { ...m, role: newRole as "admin" | "agent" } : m
      )
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage who has access to your organization
              </CardDescription>
            </div>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, email: e.target.value })
                      }
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(value) =>
                        setInviteForm({ ...inviteForm, role: value })
                      }
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Admins can manage settings and team. Agents can only handle conversations.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setInviteOpen(false)}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={inviting || !inviteForm.email}>
                    {inviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invite
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-secondary text-foreground">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{member.name}</p>
                      {member.status === "pending" && (
                        <Badge variant="outline" className="text-xs border-border">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                    {member.role}
                  </Badge>
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleChange(
                              member.id,
                              member.role === "admin" ? "agent" : "admin"
                            )
                          }
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make {member.role === "admin" ? "Agent" : "Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemove(member.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            Understanding what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">Owner</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Full access to all features</li>
                <li>Manage billing and subscription</li>
                <li>Delete organization</li>
                <li>Transfer ownership</li>
              </ul>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">Admin</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Manage team members</li>
                <li>Configure settings</li>
                <li>Create flows and campaigns</li>
                <li>View all conversations</li>
              </ul>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">Agent</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Handle assigned conversations</li>
                <li>View contacts</li>
                <li>Use templates</li>
                <li>Limited settings access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
