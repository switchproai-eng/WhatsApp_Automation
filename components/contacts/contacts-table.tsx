"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreHorizontal,
  MessageSquare,
  Edit,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  Phone,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Contact {
  id: string
  whatsapp_id: string
  phone_number: string
  name: string | null
  email: string | null
  avatar_url: string | null
  tags: string[]
  opted_in: boolean
  last_message_at: string | null
  created_at: string
  conversation_count: string
  total_messages: string
  agent_phone_numbers: string[]
}

interface ContactTag {
  id: string
  name: string
  color: string
}

interface ContactsTableProps {
  contacts: Contact[]
  tags: ContactTag[]
  tenantId: string
}

export function ContactsTable({ contacts, tags, tenantId }: ContactsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  // Suppress unused variable warning
  void tenantId
  void tags

  const filteredContacts = contacts.filter((contact) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.phone_number.includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower)
    )
  })

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((c) => c !== id))
    } else {
      setSelectedContacts([...selectedContacts, id])
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary"
            />
          </div>
          <div className="flex items-center gap-2">
            {selectedContacts.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedContacts.length} selected
                </span>
                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                  <Tag className="w-4 h-4" />
                  Add Tags
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedContacts.length === filteredContacts.length &&
                    filteredContacts.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="border-border">
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleSelect(contact.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={contact.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {contact.name?.charAt(0).toUpperCase() ||
                            contact.phone_number.charAt(1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {contact.name || "Unknown"}
                        </p>
                        {contact.email && (
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{contact.phone_number}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.agent_phone_numbers && contact.agent_phone_numbers.length > 0 ? (
                        contact.agent_phone_numbers.slice(0, 2).map((phone) => (
                          <Badge key={phone} variant="outline" className="text-xs gap-1 font-mono">
                            <Phone className="w-3 h-3" />
                            {phone}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                      {contact.agent_phone_numbers && contact.agent_phone_numbers.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.agent_phone_numbers.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No tags</span>
                      )}
                      {contact.tags && contact.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{contact.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        contact.opted_in ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {contact.opted_in ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Opted In
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          Opted Out
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.last_message_at
                      ? formatDistanceToNow(new Date(contact.last_message_at), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {parseInt(contact.total_messages).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/inbox?contact=${contact.id}`)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="w-4 h-4 mr-2" />
                          Manage Tags
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
