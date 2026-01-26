"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";

interface Agent {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      } else {
        toast({ title: "Error", description: "Failed to load agents" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load agents" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this agent?')) return;

    try {
      const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAgents();
        toast({ title: "Success", description: "Agent deleted" });
      } else {
        toast({ title: "Error", description: "Failed to delete agent" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete agent" });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const agent = agents.find(a => a.id === id);
      const res = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agent?.name, config: {}, is_default: true })
      });
      if (res.ok) {
        fetchAgents();
        toast({ title: "Success", description: "Set as default agent" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to set default" });
    }
  };

  if (loading) return <div className="p-8">Loading agents...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage your AI agents</p>
        </div>
        <Button onClick={() => router.push('/dashboard/agents/new')}>Create New Agent</Button>
      </div>

      {agents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Agents</CardTitle>
            <CardDescription>Create your first agent to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard/agents/new')} className="w-full">
              Create Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Agents ({agents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>
                      <Badge variant={agent.is_default ? "default" : "secondary"}>
                        {agent.is_default ? "Default" : "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(agent.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => router.push(`/dashboard/agents/${agent.id}`)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(agent.id)}>
                        Delete
                      </Button>
                      {!agent.is_default && (
                        <Button variant="outline" size="sm" className="ml-2" onClick={() => handleSetDefault(agent.id)}>
                          Set Default
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
