import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useWhatsAppNotifs } from "@/contexts/WhatsAppNotifsContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Bot, Send, UserRound, MessageCircle, RefreshCw, HandshakeIcon,
  Search, Zap, Sparkles, Loader2, Settings2, Trash2, Plus, Package,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/shared/PageHeader";
import { canAccessRoles } from "@/lib/roles";

const STATUS_BADGE_STYLE: Record<string, string> = {
  open: "bg-success text-success-foreground",
  handoff: "bg-yellow-500 text-white",
  closed: "bg-muted text-muted-foreground",
};

export default function WhatsAppInbox() {
  const { tenantId, branchId, roles } = useTenantContext();
  const { clearUnread } = useWhatsAppNotifs();
  const { t } = useLanguage();
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Product search state
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productQuery, setProductQuery] = useState("");

  // Quick replies state
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);
  const [manageQrOpen, setManageQrOpen] = useState(false);
  const [newQrTitle, setNewQrTitle] = useState("");
  const [newQrBody, setNewQrBody] = useState("");

  const isAdmin = canAccessRoles(roles, ["owner", "admin", "manager"]);

  // Clear unread counter when inbox is open
  useEffect(() => { clearUnread(); }, [clearUnread]);

  // ── Data queries ─────────────────────────────────────────────

  const { data: conversations = [] } = useQuery({
    queryKey: ["wa-conversations", tenantId],
    enabled: !!tenantId,
    refetchInterval: 15_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_conversations")
        .select("id, channel, customer_phone, customer_name, status, last_message_at, branch_id, branches(name)")
        .eq("tenant_id", tenantId!)
        .order("last_message_at", { ascending: false })
        .limit(60);
      return data ?? [];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["wa-messages", selectedId],
    enabled: !!selectedId,
    refetchInterval: 5_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_messages")
        .select("id, direction, body, created_at, payload")
        .eq("conversation_id", selectedId!)
        .in("direction", ["inbound", "outbound"])
        .order("created_at", { ascending: true })
        .limit(100);
      return data ?? [];
    },
  });

  // Product search
  const { data: productResults = [], isFetching: searchingProducts } = useQuery({
    queryKey: ["wa-product-search", productQuery, tenantId, branchId],
    enabled: productSearchOpen && productQuery.trim().length > 1 && !!tenantId && !!branchId,
    queryFn: async () => {
      const { data } = await supabase.rpc("ai_search_catalog", {
        _tenant_id: tenantId!,
        _branch_id: branchId!,
        _query: productQuery.trim(),
        _limit: 8,
      });
      return ((data as any[]) ?? []) as any[];
    },
  });

  // Quick replies
  const { data: quickReplies = [], refetch: refetchQr } = useQuery({
    queryKey: ["wa-quick-replies", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("wa_quick_replies")
        .select("id, title, body, sort_order")
        .eq("tenant_id", tenantId!)
        .order("sort_order")
        .order("title");
      return ((data as any[]) ?? []) as any[];
    },
  });

  // ── Realtime subscriptions ────────────────────────────────────

  useEffect(() => {
    if (!selectedId) return;
    const ch = supabase.channel(`wa-msgs-${selectedId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "ai_messages",
        filter: `conversation_id=eq.${selectedId}`,
      }, () => { qc.invalidateQueries({ queryKey: ["wa-messages", selectedId] }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedId, qc]);

  useEffect(() => {
    if (!tenantId) return;
    const ch = supabase.channel("wa-convs")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_conversations" },
        () => { qc.invalidateQueries({ queryKey: ["wa-conversations", tenantId] }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [tenantId, qc]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Actions ───────────────────────────────────────────────────

  const selectedConv = conversations.find((c: any) => c.id === selectedId);

  const sendReply = async () => {
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ conversation_id: selectedId, text: reply.trim() }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Error enviando");
      setReply("");
      qc.invalidateQueries({ queryKey: ["wa-messages", selectedId] });
      qc.invalidateQueries({ queryKey: ["wa-conversations", tenantId] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const retakeBot = async () => {
    if (!selectedId) return;
    await supabase.from("ai_conversations").update({ status: "open", handoff_reason: null }).eq("id", selectedId);
    qc.invalidateQueries({ queryKey: ["wa-conversations", tenantId] });
    toast.success(t("whatsapp.bot_resumed"));
  };

  const markHandoff = async () => {
    if (!selectedId) return;
    await supabase.from("ai_conversations").update({ status: "handoff" }).eq("id", selectedId);
    qc.invalidateQueries({ queryKey: ["wa-conversations", tenantId] });
  };

  const insertProductText = (product: any) => {
    const formatted = `📦 *${product.name}* — $${Number(product.price).toLocaleString("es-CO")} COP`;
    setReply((prev) => (prev ? `${prev}\n${formatted}` : formatted));
    setProductSearchOpen(false);
    setProductQuery("");
  };

  const insertQuickReply = (body: string) => {
    setReply(body);
    setQuickRepliesOpen(false);
  };

  const askAiSuggestion = async () => {
    if (!selectedId) return;
    const lastInbound = [...messages].reverse().find((m: any) => m.direction === "inbound");
    if (!lastInbound) { toast.error(t("whatsapp.no_inbound")); return; }

    setAiSuggesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-order-agent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ conversation_id: selectedId, message: lastInbound.body, preview: true }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error generando sugerencia");
      if (data.reply) {
        setReply(data.reply);
        toast.success(t("whatsapp.suggestion_ready"));
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAiSuggesting(false);
    }
  };

  // ── Quick reply CRUD ──────────────────────────────────────────

  const saveQuickReply = async () => {
    if (!newQrTitle.trim() || !newQrBody.trim() || !tenantId) return;
    const { error } = await (supabase as any).from("wa_quick_replies").insert({
      tenant_id: tenantId,
      title: newQrTitle.trim(),
      body: newQrBody.trim(),
    });
    if (error) { toast.error(error.message); return; }
    setNewQrTitle("");
    setNewQrBody("");
    refetchQr();
    toast.success(t("whatsapp.reply_saved"));
  };

  const deleteQuickReply = async (id: string) => {
    await (supabase as any).from("wa_quick_replies").delete().eq("id", id);
    refetchQr();
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left: conversation list */}
      <div className="w-80 shrink-0 border-r flex flex-col">
        <div className="p-4 border-b">
          <PageHeader
            eyebrow={t("whatsapp.meta")}
            title={t("whatsapp.title")}
            description={`${conversations.length} ${conversations.length === 1 ? t("whatsapp.subtitle.single") : t("whatsapp.subtitle.plural")}`}
          />
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((conv: any) => {
            const statusKey = conv.status === "open" ? (t("table_order.open") || "Open") : conv.status === "handoff" ? (t("whatsapp.status_agent") || "Human agent") : (t("common.closed") || "Closed");
            const style = STATUS_BADGE_STYLE[conv.status] ?? STATUS_BADGE_STYLE.open;
            return (
              <button
                type="button"
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b hover:bg-accent/50 transition-colors",
                  selectedId === conv.id && "bg-accent"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-sm truncate">
                      {conv.customer_name || conv.customer_phone || (t("common.unknown") || "Unknown")}
                    </span>
                  </div>
                  <Badge className={`text-[10px] shrink-0 ${style}`}>{statusKey}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex justify-between">
                  <span>{(conv.branches as any)?.name ?? "—"}</span>
                  <span>{formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}</span>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {t("whatsapp.chat.empty")}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: chat */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{selectedConv.customer_name || selectedConv.customer_phone}</p>
              <p className="text-xs text-muted-foreground">{selectedConv.customer_phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={STATUS_BADGE_STYLE[selectedConv.status] ?? STATUS_BADGE_STYLE.open}>
                {selectedConv.status === "open" ? (t("table_order.open") || "Open") : selectedConv.status === "handoff" ? (t("whatsapp.status_agent") || "Human agent") : (t("common.closed") || "Closed")}
              </Badge>
              {selectedConv.status === "handoff" && (
                <Button size="sm" variant="outline" onClick={retakeBot} title={t("whatsapp.resume_bot") || "Resume AI bot"}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> {t("whatsapp.resume_bot") || "Resume Bot"}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={markHandoff} title={t("whatsapp.pause_bot") || "Take over chat"}>
                <HandshakeIcon className="h-3.5 w-3.5 mr-1" /> {t("whatsapp.take_over") || "Take Over"}
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((m: any) => {
                const isInbound = m.direction === "inbound";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-2 max-w-[75%]",
                      isInbound ? "mr-auto" : "ml-auto flex-row-reverse"
                    )}
                  >
                    <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs",
                      isInbound ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                    )}>
                      {isInbound ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className={cn(
                      "rounded-2xl px-3.5 py-2 text-sm space-y-1 shadow-sm",
                      isInbound ? "bg-muted/70 text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}>
                      <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                      <p className={cn("text-[10px] tabular-nums text-right opacity-60")}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Bottom actions & composer */}
          <div className="p-3 border-t space-y-2 bg-card">
            {/* Quick action tool bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Product search popover */}
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Package className="h-3 w-3" /> {t("nav.catalog") || "Catalog"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2" align="start">
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t("table_order.search_product") || "Search product..."}
                        className="pl-8 h-8 text-xs"
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {searchingProducts && (
                        <div className="p-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> {t("common.loading") || "Searching..."}
                        </div>
                      )}
                      {productResults.map((p: any) => (
                        <button
                          type="button"
                          key={p.id || p.product_id}
                          onClick={() => insertProductText(p)}
                          className="w-full text-left p-1.5 rounded hover:bg-accent flex justify-between items-center text-xs"
                        >
                          <span className="font-medium truncate">{p.name}</span>
                          <span className="text-muted-foreground tabular-nums shrink-0 ml-2">
                            ${Number(p.price).toLocaleString()}
                          </span>
                        </button>
                      ))}
                      {!searchingProducts && productQuery.trim().length > 1 && productResults.length === 0 && (
                        <p className="text-xs text-muted-foreground p-2 text-center">{t("table_order.no_products") || "No products"}</p>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Quick replies popover */}
              <Popover open={quickRepliesOpen} onOpenChange={setQuickRepliesOpen}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Zap className="h-3 w-3" /> {t("whatsapp.quick_replies") || "Quick Replies"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2" align="start">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b">
                    <span className="text-xs font-semibold">{t("whatsapp.quick_replies") || "Quick Replies"}</span>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => { setQuickRepliesOpen(false); setManageQrOpen(true); }}
                        title={t("common.settings") || "Settings"}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {quickReplies.map((qr: any) => (
                      <button
                        type="button"
                        key={qr.id}
                        onClick={() => insertQuickReply(qr.body)}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-accent"
                      >
                        <p className="text-xs font-medium">{qr.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{qr.body}</p>
                      </button>
                    ))}
                    {quickReplies.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2 text-center">
                        {t("whatsapp.no_quick_replies") || "No quick replies yet"}
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* AI suggestion */}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={askAiSuggestion}
                disabled={aiSuggesting}
                title={t("whatsapp.ai_suggest_tooltip") || "Generate reply suggestion"}
              >
                {aiSuggesting
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Sparkles className="h-3 w-3" />}
                {aiSuggesting ? `${t("common.loading") || "Thinking"}...` : (t("whatsapp.ai_suggest") || "AI Suggestion")}
              </Button>
            </div>

            {/* Reply input */}
            <div className="flex gap-2">
              <Input
                placeholder={t("whatsapp.msg.placeholder")}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                disabled={sending}
              />
              <Button onClick={sendReply} disabled={sending || !reply.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <MessageCircle className="h-12 w-12 mx-auto opacity-20" />
            <p>{t("whatsapp.chat.empty")}</p>
          </div>
        </div>
      )}

      {/* ── Manage quick replies dialog ─────────────────────────── */}
      <Dialog open={manageQrOpen} onOpenChange={setManageQrOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("whatsapp.quick_replies") || "Manage Quick Replies"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Existing */}
            <div className="max-h-52 overflow-y-auto space-y-1">
              {quickReplies.map((qr: any) => (
                <div key={qr.id} className="flex items-start gap-2 p-2 rounded border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{qr.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{qr.body}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => deleteQuickReply(qr.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {quickReplies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t("whatsapp.no_quick_replies") || "No quick replies yet"}</p>
              )}
            </div>

            {/* New reply form */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium">{t("whatsapp.new_reply") || "New Reply"}</p>
              <Input
                placeholder={t("whatsapp.new_reply_title_ph") || "Short title (e.g. Greeting, Hours...)"}
                value={newQrTitle}
                onChange={(e) => setNewQrTitle(e.target.value)}
              />
              <Textarea
                placeholder={t("whatsapp.new_reply_body_ph") || "Message text..."}
                value={newQrBody}
                onChange={(e) => setNewQrBody(e.target.value)}
                rows={3}
              />
              <Button
                size="sm"
                onClick={saveQuickReply}
                disabled={!newQrTitle.trim() || !newQrBody.trim()}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
