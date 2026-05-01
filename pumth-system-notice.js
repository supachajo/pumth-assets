/* /assets/js/pumth-system-notice.js — PUM-TH.COM System Notice (Light Theme + Risk Disclosure) | requires SweetAlert2 */
(function () {
  if (window.__PUMTH_SYSTEM_NOTICE_V1__) return;
  window.__PUMTH_SYSTEM_NOTICE_V1__ = true;

  const PUM = {
    siteName: "PUM-TH.COM",

    // Theme (Light + Blue accent)
    primary: "#5B6FED",
    primaryDark: "#4F63E0",
    text: "#1F2937",
    muted: "#6B7280",
    fine: "#9CA3AF",
    bg: "#FFFFFF",
    rowBg: "#FFFFFF",
    rowBorder: "rgba(17,24,39,.08)",

    // Behavior
    releaseTag: "pumth-2026-05-01-light",
    cacheKey: "pumth_system_notice_cache",
    cacheMs: 180 * 60 * 1000, // 3 ชม.
    gateSec: 4,

    // Copy
    title: "ประกาศสำคัญเกี่ยวกับระบบ",
    subtitle: "แพลตฟอร์มมีการอัปเดตใหญ่ โปรดอ่านเพื่อสิทธิประโยชน์ของท่าน",
    items: [
      { icon: "chart-down", color: "#EF4444", tint: "#FEE2E2", text: "ยอดอาจลดลงได้ถึง 100% ตามสถานการณ์แพลตฟอร์ม" },
      { icon: "shield",     color: "#3B82F6", tint: "#DBEAFE", text: 'บริการ "มีรับประกัน" ยอดก็สามารถลดลงได้เช่นกัน' },
      { icon: "ban",        color: "#EF4444", tint: "#FEE2E2", text: 'บริการ "ไม่มีเติมยอด" จะไม่เติมให้ทุกกรณี' },
      { icon: "hourglass",  color: "#F59E0B", tint: "#FEF3C7", text: 'บริการ "มีเติมยอดฟรี" เติมให้เฉพาะในช่วงรับประกัน' },
      { icon: "warning",    color: "#F59E0B", tint: "#FEF3C7", text: "หากยอมรับความเสี่ยงไม่ได้ แนะนำหยุดสั่งซื้อชั่วคราว" },
    ],
    finePrint: "การกดปิดหรือรับทราบ ถือว่าท่านยอมรับเงื่อนไขและเข้าใจความเสี่ยงแล้ว",
    actionText: "รับทราบและยอมรับความเสี่ยง",
  };

  const okSwal = () => window.Swal && typeof Swal.fire === "function";
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // Home only
  function isHome() {
    const p = window.location.pathname || "/";
    return p === "/" || p === "" || p === "/index.php";
  }

  // Login detector (รองรับหลายธีม)
  function readUsername() {
    const groups = [
      [".totals-block__card", ".fas.fa-user, .fa-user", ".totals-block__count-value"],
      [".card, .dashboard-card, .info-card, .totals-card", ".fas.fa-user, .fa-user, .bi-person, .bi-person-fill", "h1,h2,h3,.value,.count,.title,.name"],
      [".navbar, header, .topbar, .header", null, ".username,.user-name,.account-name,.profile-name"],
    ];

    for (const [wrapSel, iconSel, valSel] of groups) {
      const blocks = document.querySelectorAll(wrapSel);
      if (!blocks || !blocks.length) continue;

      for (const b of blocks) {
        if (iconSel) {
          const ic = b.querySelector(iconSel);
          if (!ic) continue;
        }
        const el = b.querySelector(valSel);
        if (!el) continue;

        const raw = (el.innerText || el.textContent || "").trim();
        const u = raw.replace(/\s+/g, "");
        if (!u) continue;

        if (/^[\d,]+$/.test(u)) continue;
        if (/^฿/.test(u)) continue;
        if (u.length > 40) continue;
        if (!/^[a-zA-Z0-9._-]+$/.test(u)) continue;

        return u;
      }
    }
    return "";
  }

  const isAuthed = () => !!readUsername();

  function loadCache() {
    try {
      const raw = localStorage.getItem(PUM.cacheKey);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function saveCache() {
    try {
      localStorage.setItem(
        PUM.cacheKey,
        JSON.stringify({ v: PUM.releaseTag, ts: Date.now() })
      );
    } catch (_) {}
  }

  function needShow() {
    const c = loadCache();
    if (!c) return true;
    if (c.v !== PUM.releaseTag) return true;
    return Date.now() - c.ts >= PUM.cacheMs;
  }

  // ------- Icons -------
  function iconSvg(name) {
    switch (name) {
      case "chart-down":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`;
      case "shield":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      case "ban":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`;
      case "hourglass":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.17a2 2 0 0 0-.59-1.41L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22"/><path d="M7 2v4.17a2 2 0 0 0 .59 1.41L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/></svg>`;
      case "warning":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
      case "x":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      default:
        return "";
    }
  }

  function ensureStyle() {
    if (document.getElementById("pumthNoticeStyleV2")) return;

    const st = document.createElement("style");
    st.id = "pumthNoticeStyleV2";
    st.textContent = `
      .pumNotice{font-family:Prompt,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;position:relative}
      .swal2-popup.pumNotice__popup{
        padding:0!important;border-radius:22px!important;overflow:hidden!important;
        background:${PUM.bg}!important;border:0!important;
        box-shadow:0 24px 88px rgba(17,24,39,.18)!important;
        max-width:min(480px,92vw)!important;
      }
      .swal2-html-container{margin:0!important;padding:0!important}
      .swal2-close{display:none!important}

      .pumNotice__close{
        position:absolute;top:14px;right:14px;
        width:32px;height:32px;border-radius:50%;
        border:1.5px solid #FCA5A5;background:#fff;color:#EF4444;
        cursor:pointer;display:grid;place-items:center;
        transition:background .15s,transform .15s;
        z-index:10;padding:0;
      }
      .pumNotice__close:hover{background:#FEE2E2;transform:scale(1.05)}
      .pumNotice__close svg{width:16px;height:16px}

      .pumNotice__head{padding:22px 22px 14px;text-align:left}
      .pumNotice__title{
        margin:0;font-size:18px;font-weight:800;color:${PUM.text};
        letter-spacing:.2px;padding-right:36px;
      }
      .pumNotice__sub{margin:6px 0 0;font-size:13.5px;line-height:1.5;color:${PUM.muted}}

      .pumNotice__list{margin:0;padding:0 18px;list-style:none;display:grid;gap:8px}
      .pumNotice__row{
        display:flex;align-items:center;gap:12px;
        padding:12px 14px;
        border:1px solid ${PUM.rowBorder};
        border-radius:14px;
        background:${PUM.rowBg};
        box-shadow:0 1px 2px rgba(17,24,39,.04);
      }
      .pumNotice__ic{
        width:32px;height:32px;border-radius:50%;
        display:grid;place-items:center;flex:0 0 auto;
      }
      .pumNotice__ic svg{width:16px;height:16px}
      .pumNotice__txt{font-size:13.5px;line-height:1.4;color:${PUM.text};font-weight:500}

      .pumNotice__foot{
        padding:18px 22px 22px;
        display:flex;flex-direction:column;gap:14px;
      }
      .pumNotice__fine{
        margin:0;font-size:12px;line-height:1.5;color:${PUM.fine};
        text-align:center;
      }
      .pumNotice__btn{
        width:100%;padding:14px 20px;border:0;border-radius:14px;
        background:${PUM.primary};color:#fff;
        font-size:15px;font-weight:700;cursor:pointer;
        transition:background .15s,transform .05s;
        font-family:inherit;
        box-shadow:0 8px 20px rgba(91,111,237,.25);
      }
      .pumNotice__btn:hover:not(:disabled){background:${PUM.primaryDark}}
      .pumNotice__btn:active:not(:disabled){transform:translateY(1px)}
      .pumNotice__btn:disabled{opacity:.6;cursor:not-allowed;box-shadow:none}
    `;
    document.head.appendChild(st);
  }

  function html() {
    return `
      <div class="pumNotice">
        <button id="pumthCloseBtn" class="pumNotice__close" aria-label="ปิด" type="button">
          ${iconSvg("x")}
        </button>

        <div class="pumNotice__head">
          <h2 class="pumNotice__title">⚠️ ${esc(PUM.title)}</h2>
          <p class="pumNotice__sub">${esc(PUM.subtitle)}</p>
        </div>

        <ul class="pumNotice__list">
          ${PUM.items
            .map(
              (it) => `
            <li class="pumNotice__row">
              <span class="pumNotice__ic" style="color:${it.color};background:${it.tint}">
                ${iconSvg(it.icon)}
              </span>
              <div class="pumNotice__txt">${esc(it.text)}</div>
            </li>`
            )
            .join("")}
        </ul>

        <div class="pumNotice__foot">
          <p class="pumNotice__fine">${esc(PUM.finePrint)}</p>
          <button id="pumthAckBtn" class="pumNotice__btn" disabled type="button">
            ${esc(PUM.actionText)} <span id="pumthCd"></span>
          </button>
        </div>
      </div>
    `;
  }

  async function openNotice() {
    if (!okSwal()) return;
    ensureStyle();

    await Swal.fire({
      html: html(),
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: "rgba(17,24,39,.55)",
      customClass: { popup: "pumNotice__popup" },
      didOpen: (root) => {
        const btn = root.querySelector("#pumthAckBtn");
        const cd = root.querySelector("#pumthCd");
        const closeBtn = root.querySelector("#pumthCloseBtn");
        let s = PUM.gateSec;

        const tick = () => {
          cd.textContent = s > 0 ? ` (${s}s)` : "";
          btn.disabled = s > 0;
          if (s-- <= 0) clearInterval(t);
        };
        tick();
        const t = setInterval(tick, 1000);

        const accept = () => {
          saveCache();
          Swal.close();
        };

        btn.onclick = accept;
        closeBtn.onclick = accept; // กดปิด = ยอมรับ (ตาม fine print)
      },
    });
  }

  function boot() {
    if (!isHome()) return;

    const tryRun = () => {
      if (!isAuthed()) return false;
      if (!needShow()) return true;
      requestAnimationFrame(() => openNotice());
      return true;
    };

    if (tryRun()) return;

    const mo = new MutationObserver(() => {
      if (tryRun()) mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 8000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  // Optional debug handle
  window.PUMTH_SystemNotice = {
    show: openNotice,
    clear: () => localStorage.removeItem(PUM.cacheKey),
    _debug: { isHome, readUsername, isAuthed, needShow },
  };
})();
