import { useState, useRef, useEffect } from "react";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Send, Plus, TrendingUp, Package, Users, Truck, Wallet,
  ArrowUpRight, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  chart?: boolean;
  insights?: string[];
  actions?: string[];
}

function AiOrb({ size = 34 }: { size?: number }) {
  const sizeClass = size >= 48 ? "g-ai-orb-50" : "g-ai-orb-34";
  const iconSize = Math.round(size * 0.47);
  return (
    <div className={`orb ${sizeClass}`}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white">
        <path d="M12 2 L14 8 L20 9.5 L15.5 13 L17 19 L12 16 L7 19 L8.5 13 L4 9.5 L10 8 Z" />
      </svg>
    </div>
  );
}

function UserOrb({ initials }: { initials: string }) {
  return (
    <div className="g-topbar-avatar g-ai-user-orb">
      {initials}
    </div>
  );
}

function MarginBarChart({ title, source }: { title: string; source: string }) {
  const data = [
    { name: "Capuchino Clásico",     margin: 71 },
    { name: "Cheesecake de Fresa",   margin: 68 },
    { name: "Frappé Mocha",          margin: 64 },
    { name: "Croissant Mantequilla", margin: 58 },
    { name: "Latte Vainilla",        margin: 55 },
  ];
  return (
    <div className="glass-thin g-ai-chart-wrap">
      <div className="flex justify-between items-center mb-3">
        <span className="h-label">{title}</span>
        <span className="h-meta">{source}</span>
      </div>
      <div className="g-ai-margin-chart">
        {data.map((d, i) => (
          <div key={i} className="g-ai-margin-row">
            <span className="g-ai-margin-label">{d.name}</span>
            <div className="g-ai-margin-bar-track">
              <div className="g-ai-margin-bar-fill" {...{ style: { width: `${d.margin}%` } }} />
              <span className="g-ai-margin-pct">{d.margin}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIAgent() {
  const { roles } = useTenantContext();
  const { t } = useLanguage();
  const initials = (roles[0] ?? "U").slice(0, 2).toUpperCase();

  const SUGGESTIONS = [
    t("ai.suggest.sales_by_hour"),
    t("ai.suggest.supplies"),
    t("ai.suggest.top_customers"),
    t("ai.suggest.compare_branches"),
  ];

  const DATA_SOURCES = [
    { icon: TrendingUp, label: t("ai.source.sales"), sub: t("ai.source.sales.sub") },
    { icon: Package,   label: t("ai.source.inventory"),  sub: t("ai.source.inventory.sub") },
    { icon: Users,     label: t("ai.source.crm"), sub: t("ai.source.crm.sub") },
    { icon: Truck,     label: t("ai.source.digital"), sub: t("ai.source.digital.sub") },
    { icon: Wallet,    label: t("ai.source.cash"), sub: t("ai.source.cash.sub") },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: t("ai.msg.welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 1400));
    setTyping(false);

    const lower = text.toLowerCase();
    let aiMsg: Message;
    if (lower.includes("margin") || lower.includes("margen") || lower.includes("product") || lower.includes("bidhaa")) {
      aiMsg = {
        id: crypto.randomUUID(),
        role: "ai",
        text: t("ai.msg.margin_analysis"),
        chart: true,
        insights: [
          t("ai.insight.margin1"),
          t("ai.insight.margin2"),
        ],
        actions: [t("ai.action.create_transfer"), t("ai.action.export_report")],
      };
    } else if (lower.includes("vent") || lower.includes("sale") || lower.includes("mauzo") || lower.includes("today") || lower.includes("hoy")) {
      aiMsg = {
        id: crypto.randomUUID(),
        role: "ai",
        text: t("ai.msg.sales_today"),
        actions: [t("ai.action.view_dashboard"), t("ai.action.export_excel")],
      };
    } else {
      aiMsg = {
        id: crypto.randomUUID(),
        role: "ai",
        text: t("ai.msg.understanding"),
        actions: [t("ai.action.view_sales"), t("ai.action.view_inventory")],
      };
    }

    setMessages((m) => [...m, aiMsg]);
  };

  return (
    <div className="g-ai-stage">
      {/* Chat column */}
      <div className="g-ai-chat-col">
        {/* Header */}
        <div className="glass g-ai-header">
          <AiOrb size={50} />
          <div className="g-ai-header-info">
            <div className="g-ai-header-title h-display">
              {t("ai.title")}
              <span className="pill pill-brand g-kds-pill-micro">{t("ai.beta")}</span>
            </div>
            <div className="h-meta">{t("ai.subtitle")}</div>
          </div>
          <div className="pill pill-ok">
            <span className="dot dot-ok" />
            {t("ai.status.online")}
          </div>
        </div>

        {/* Messages */}
        <div className="g-ai-msgs">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end gap-2 items-end">
                <div className="g-ai-bubble-user">{m.text}</div>
                <UserOrb initials={initials} />
              </div>
            ) : (
              <div key={m.id} className="g-ai-bubble-ai">
                <AiOrb size={34} />
                <div className="glass-strong g-ai-bubble-ai-body">
                  <div className="g-ai-bubble-ai-text">{m.text}</div>
                  {m.chart && <MarginBarChart title={t("ai.chart.margin.title")} source={t("ai.chart.margin.source")} />}
                  {m.insights && (
                    <div className="flex flex-col gap-2">
                      {m.insights.map((s, i) => (
                        <div key={i} className="g-ai-insight">
                          <ArrowUpRight size={14} className="g-ai-insight-icon" />
                          <span className="g-ai-insight-text">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.actions && (
                    <div className="flex gap-2 flex-wrap">
                      {m.actions.map((a, i) => (
                        <button key={i} type="button" className="g-btn g-btn-ghost g-btn-sm">
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {typing && (
            <div className="g-ai-typing">
              <AiOrb size={34} />
              <div className="glass-thin g-ai-typing-bubble">
                <span className="g-ai-typing-dots">
                  <span className="dot dot-brand g-ai-dot-pulse" />
                  <span className="dot dot-brand g-ai-dot-mid" />
                  <span className="dot dot-brand g-ai-dot-dim" />
                </span>
                <span className="g-ai-typing-text">{t("ai.typing")}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="glass-strong g-ai-composer">
          <div className="g-ai-composer-row">
            <button type="button" title={t("ai.attach")} className="g-btn g-btn-ghost g-ai-composer-btn-attach">
              <Plus size={16} />
            </button>
            <input
              className="g-ai-composer-placeholder bg-transparent border-none outline-none"
              placeholder={t("ai.placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send(input))}
            />
            <button
              type="button"
              title={t("ai.send")}
              className="g-btn g-btn-primary g-ai-composer-btn-send"
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
            >
              <Send size={15} />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i} type="button"
                className="pill pill-ghost pill-sm"
                onClick={() => send(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="g-ai-side">
        {/* Data sources */}
        <div className="glass g-ai-sources">
          <div className="h-display g-ai-section-title">{t("ai.sources.title")}</div>
          {DATA_SOURCES.map(({ icon: Icon, label, sub }, i) => (
            <div key={i} className="g-ai-source-row">
              <div className="g-ai-source-icon">
                <Icon size={14} />
              </div>
              <div className="g-ai-source-info">
                <div className="g-ai-source-name">{label}</div>
                <div className="h-meta">{sub}</div>
              </div>
              <span className="dot dot-ok" />
            </div>
          ))}
        </div>

        {/* Recent actions */}
        <div className="glass g-ai-actions-panel">
          <div className="h-display g-ai-section-title">{t("ai.actions.title")}</div>
          {[
            { l: t("ai.action.report_sent"), s: t("ai.action.report_sent.sub"), ok: true },
            { l: t("ai.action.stock_alert"),  s: t("ai.action.stock_alert.sub"),  ok: false },
          ].map((r, i) => (
            <div key={i} className="glass-thin g-ai-action-row">
              <span className={cn("dot", r.ok ? "dot-ok" : "dot-warn")} />
              <div className="g-ai-source-info">
                <div className="g-ai-source-name">{r.l}</div>
                <div className="h-meta">{r.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-thin g-ai-privacy-note">
          {t("ai.privacy_note")}
        </div>
      </div>
    </div>
  );
}
