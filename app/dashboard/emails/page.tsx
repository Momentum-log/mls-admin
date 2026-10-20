"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import {
  useEmailTemplates,
  useSendOneOffEmail,
  useUpsertEmailTemplate,
} from "@/hooks/admin/use-email-templates";
import type { EmailTemplate, EmailTemplateType } from "@/types/email-template";
import { formatDateTime } from "@/utils/format-date";
import { EXAMPLE_MESSAGES } from "@/lib/email/example-messages";
import { toEmailHtml } from "@/lib/email/to-email-html";
import { EmailPreview } from "@/components/emails/email-preview";
import { RichTextEditor } from "@/components/emails/rich-text-editor";
import { Can } from "@/components/auth/can";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Info, Loader2, Mail, Plus, Send } from "lucide-react";

const DEFAULT_SENDER_NAME = "Momentum Logistics Services";

const TYPES: EmailTemplateType[] = ["SERVICE", "MARKETING", "AUTHENTICATION"];

const templateSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9][a-z0-9-_]*$/,
      "Use lowercase letters, numbers, - or _ for the name.",
    ),
  subject: z.string().trim().min(1, "Add a subject."),
  body: z.string().trim().min(1, "Add the email body."),
  type: z.enum(["AUTHENTICATION", "SERVICE", "MARKETING"]),
});

const sendSchema = z.object({
  to: z.string().trim().email("Enter a valid email address."),
  subject: z.string().trim().min(1, "Add a subject."),
  preheader: z.string().trim().max(200).optional(),
  html: z.string().trim().min(1, "Write the message."),
  fromName: z.string().trim().optional(),
});

function TemplateDialog({
  open,
  template,
  onOpenChange,
}: {
  open: boolean;
  template: EmailTemplate | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {template ? `Edit ${template.name}` : "New template"}
          </DialogTitle>
          <DialogDescription>
            The body is Handlebars: {"{{name}}"} inserts a value the server
            passes in.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts from the chosen template. */}
        <TemplateForm template={template} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TemplateForm({
  template,
  onDone,
}: {
  template: EmailTemplate | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState(
    template
      ? {
          name: template.name,
          subject: template.subject,
          body: template.body,
          type: template.type,
        }
      : {
          name: "",
          subject: "",
          body: "",
          type: "SERVICE" as EmailTemplateType,
        },
  );
  const [error, setError] = useState<string | null>(null);
  const { mutate: save, isPending } = useUpsertEmailTemplate();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = templateSchema.safeParse(form);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Check the form.");
          return;
        }
        save(parsed.data, { onSuccess: onDone });
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tpl-name">Name</Label>
          <Input
            id="tpl-name"
            value={form.name}
            disabled={!!template}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            value={form.type}
            onValueChange={(value) =>
              setForm({ ...form, type: value as EmailTemplateType })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tpl-subject">Subject</Label>
        <Input
          id="tpl-subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tpl-body">Body (HTML)</Label>
        <Textarea
          id="tpl-body"
          className="min-h-56 font-mono text-xs"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save template
        </Button>
      </DialogFooter>
    </form>
  );
}

function SendEmailCard() {
  const [example, setExample] = useState(EXAMPLE_MESSAGES[0]);
  // Bumped when an example is loaded, so the editor remounts with its body.
  const [editorKey, setEditorKey] = useState(0);
  const [form, setForm] = useState({
    to: "",
    subject: example.subject,
    preheader: example.preheader,
    // Sent on purpose: left empty, the server falls back to its configured
    // sender name, which showed a person's name in the demo.
    fromName: DEFAULT_SENDER_NAME,
  });
  const [body, setBody] = useState({ html: example.bodyHtml, isEmpty: false });
  const [error, setError] = useState<string | null>(null);
  const { mutate: send, isPending } = useSendOneOffEmail();
  const emailHtml = useMemo(() => toEmailHtml(body.html), [body.html]);

  const loadExample = (id: string) => {
    const next = EXAMPLE_MESSAGES.find((m) => m.id === id);
    if (!next) return;
    setExample(next);
    setForm((f) => ({ ...f, subject: next.subject, preheader: next.preheader }));
    setBody({ html: next.bodyHtml, isEmpty: false });
    setEditorKey((k) => k + 1);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="xl:self-start">
        <CardHeader>
          <CardTitle className="text-base">Send one email</CardTitle>
          <CardDescription>
            Goes out now from the MLS sender, inside the MLS email design:
            header, your message, sign-off and footer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const parsed = sendSchema.safeParse({
                ...form,
                html: body.isEmpty ? "" : emailHtml,
              });
              if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? "Check the form.");
                return;
              }
              setError(null);
              const { fromName, preheader, ...rest } = parsed.data;
              send(
                {
                  ...rest,
                  fromName: fromName || undefined,
                  preheader: preheader || undefined,
                },
                // Keep the message, so it can go to the next person too.
                { onSuccess: () => setForm((f) => ({ ...f, to: "" })) },
              );
            }}
          >
            <div className="space-y-1.5">
              <Label>Start from</Label>
              <Select value={example.id} onValueChange={loadExample}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXAMPLE_MESSAGES.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Loading an example replaces the subject and message. Replace
                the text in [square brackets] before sending.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="send-to">To</Label>
                <Input
                  id="send-to"
                  type="email"
                  value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="send-from">
                  Sender name{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="send-from"
                  placeholder={DEFAULT_SENDER_NAME}
                  value={form.fromName}
                  onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="send-subject">Subject</Label>
              <Input
                id="send-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="send-preheader">
                Preview line{" "}
                <span className="text-muted-foreground font-normal">
                  (optional, shown after the subject in the inbox)
                </span>
              </Label>
              <Input
                id="send-preheader"
                maxLength={200}
                value={form.preheader}
                onChange={(e) => setForm({ ...form, preheader: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="send-body">Message</Label>
              <RichTextEditor
                key={editorKey}
                id="send-body"
                initialContent={example.bodyHtml}
                onChange={(html, isEmpty) => setBody({ html, isEmpty })}
              />
              <p className="text-xs text-muted-foreground">
                To add a button, make a link, then press the button icon while
                the cursor is on it.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Can do="email:write" fallback="disable">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send
              </Button>
            </Can>
          </form>
        </CardContent>
      </Card>

      <Card className="xl:self-start">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>What the recipient will see.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailPreview
            subject={form.subject}
            preheader={form.preheader}
            bodyHtml={body.isEmpty ? "" : emailHtml}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Email templates kept in the database, plus a one-off sender.
 */
export default function EmailsPage() {
  const { data: templates = [], isLoading } = useEmailTemplates();
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Emails</h2>
        <p className="text-muted-foreground">
          Custom templates and one-off messages.
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="send">Send an email</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <p className="flex max-w-2xl items-start gap-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" />
              The server uses a template here only when it has no built-in email
              of the same name, so built-in emails (sign-in codes, receipts,
              tracking updates) cannot be changed here. Edits to a template the
              server has already sent take effect after it restarts.
            </p>
            <Can do="email:write" fallback="disable">
              <Button onClick={() => setCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New template
              </Button>
            </Can>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last edited</TableHead>
                  <TableHead className="text-right w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Mail className="h-10 w-10 opacity-20" />
                        <p className="font-medium">No custom templates yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-mono text-sm">
                        {template.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {template.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {template.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(template.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Can do="email:write" fallback="disable">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditing(template)}
                          >
                            Edit
                          </Button>
                        </Can>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="send">
          <SendEmailCard />
        </TabsContent>
      </Tabs>

      <TemplateDialog
        open={creating || !!editing}
        template={editing}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />
    </div>
  );
}
