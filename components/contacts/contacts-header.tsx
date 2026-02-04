"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, UserPlus, Upload, CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ContactsHeaderProps {
  stats: {
    total: number
    optedIn: number
    newThisWeek: number
  }
  tenantId: string
}

export function ContactsHeader({ stats, tenantId }: ContactsHeaderProps) {
  const router = useRouter()
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Suppress unused variable warning
  void tenantId

  async function handleAddContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formData.get("phoneNumber"),
          name: formData.get("name"),
          email: formData.get("email"),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Contact added successfully!")
        setIsAddingContact(false)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to add contact")
      }
    } catch (error) {
      console.error("Error adding contact:", error)
      toast.error("Failed to add contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter(line => line.trim())

      if (lines.length < 2) {
        toast.error("CSV file is empty or has no data rows")
        return
      }

      // Parse header
      const header = lines[0].toLowerCase().split(",").map(h => h.trim())
      const phoneIndex = header.findIndex(h => h.includes("phone") || h.includes("number") || h.includes("mobile"))
      const nameIndex = header.findIndex(h => h.includes("name"))
      const emailIndex = header.findIndex(h => h.includes("email"))

      if (phoneIndex === -1) {
        toast.error("CSV must have a column with 'phone', 'number', or 'mobile' in the header")
        return
      }

      let successCount = 0
      let errorCount = 0

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""))

        const phoneNumber = values[phoneIndex]
        if (!phoneNumber) continue

        const name = nameIndex !== -1 ? values[nameIndex] : undefined
        const email = emailIndex !== -1 ? values[emailIndex] : undefined

        try {
          const response = await fetch("/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber, name, email }),
          })

          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch {
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Imported ${successCount} contacts successfully!`)
        router.refresh()
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} contacts failed to import (may already exist)`)
      }
    } catch (error) {
      console.error("Error importing CSV:", error)
      toast.error("Failed to import CSV file")
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.total,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Opted In",
      value: stats.optedIn,
      icon: CheckCircle,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "New This Week",
      value: stats.newThisWeek,
      icon: UserPlus,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">Manage your WhatsApp contacts and audience</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImportCSV}
            className="hidden"
          />
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import CSV
              </>
            )}
          </Button>
          <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your WhatsApp audience
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="+1234567890"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingContact(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Contact"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
