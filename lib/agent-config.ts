import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useAgentConfig(agentId?: string, section: string) {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      let configData: any = {};
      if (agentId) {
        const res = await fetch(`/api/agents/${agentId}`);
        if (!res.ok) return;
        const fullData = await res.json();
        configData = fullData.agent?.config || {};
      } else {
        const res = await fetch('/api/agent/config');
        if (!res.ok) return;
        const fullData = await res.json();
        configData = fullData.config || {};
      }
      setData(configData[section] || {});
    } catch (error) {
      toast({ title: "Error", description: `Failed to load ${section}` });
    } finally {
      setLoading(false);
    }
  };

  const save = async (sectionData: any) => {
    setSaving(true);
    try {
      if (agentId) {
        const res = await fetch(`/api/agents/${agentId}`);
        if (!res.ok) throw new Error('Failed to fetch agent');
        const fullData = await res.json();
        const fullConfig = { ...fullData.agent.config };
        fullConfig[section] = sectionData;
        const updateRes = await fetch(`/api/agents/${agentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: fullData.agent.name, config: fullConfig }),
        });
        if (!updateRes.ok) throw new Error('Failed to save');
        toast({ title: "Success", description: `${section.charAt(0).toUpperCase() + section.slice(1)} saved` });
      } else {
        const res = await fetch('/api/agent/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, data: sectionData }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          toast({ title: "Error", description: `Failed to save ${section}: ${errorText}` });
          return;
        }
        toast({ title: "Success", description: `${section.charAt(0).toUpperCase() + section.slice(1)} saved` });
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to save ${section}` });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, [agentId, section]);

  return { data, setData, save, loading, saving };
}
