const STORAGE_KEY = "lidire-mvp-data";

const defaultState = {
  user: {
    name: "Alice",
    email: "",
    age: "",
    phone: ""
  },
  data: {
    compromissos: [],
    tarefas: [],
    compras: [],
    estudos: [],
    treinos: [],
    hidratacao: [],
    financas: [],
    objetivos: [],
    familia: []
  }
};

let state = loadState();
let currentPage = "inicio";
let modal = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    return {
      ...structuredClone(defaultState),
      ...saved,
      user: { ...defaultState.user, ...(saved.user || {}) },
      data: { ...defaultState.data, ...(saved.data || {}) }
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function dateBR(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toast(message, type = "success") {
  document.querySelectorAll(".lidire-toast").forEach((el) => el.remove());
  const el = document.createElement("div");
  el.className = `lidire-toast ${type}`;
  el.innerHTML = `<span>${type === "success" ? "✓" : "!"}</span>${esc(message)}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function icon(name) {
  const icons = {
    home: "⌂",
    calendar: "▣",
    check: "✓",
    cart: "🛒",
    book: "▤",
    dumbbell: "♢",
    drop: "◉",
    wallet: "R$",
    target: "◎",
    family: "♧",
    spark: "✦",
    user: "◯",
    plus: "+",
    arrow: "→",
    trash: "⌫",
    edit: "✎",
    clock: "◷",
    search: "⌕",
    back: "‹"
  };
  return icons[name] || "•";
}

const modules = [
  ["agenda", "Agenda", "Compromissos e horários", "calendar", "agenda"],
  ["tarefas", "Tarefas", "Tudo o que precisa ser feito", "check", "tarefas"],
  ["compras", "Compras", "Listas para não esquecer", "cart", "compras"],
  ["estudos", "Estudos", "Organize seu aprendizado", "book", "estudos"],
  ["treinos", "Treinos", "Movimente-se e acompanhe", "dumbbell", "treinos"],
  ["hidratacao", "Hidratação", "Cuide da sua rotina", "drop", "hidratacao"],
  ["financas", "Finanças", "Entradas e gastos", "wallet", "financas"],
  ["objetivos", "Objetivos", "Transforme planos em passos", "target", "objetivos"],
  ["familia", "Família", "Compartilhe sua rotina", "family", "familia"]
];

function appShell(content, title = "LiDire") {
  const nav = [
    ["inicio", "⌂", "Início"],
    ["agenda", "▣", "Agenda"],
    ["tarefas", "✓", "Tarefas"],
    ["explorar", "✦", "Explorar"],
    ["perfil", "◯", "Perfil"]
  ];

  return `
    <div class="app-bg">
      <header class="topbar">
        <button class="brand" data-page="inicio" aria-label="Ir para início">
          <img src="/logo-lidire-oficial.png" alt="LiDire">
          <span>LiDire</span>
        </button>
        <div class="topbar-actions">
          <button class="icon-button" data-action="quick-add" title="Adicionar">${icon("plus")}</button>
          <button class="avatar" data-page="perfil">${esc((state.user.name || "A").charAt(0).toUpperCase())}</button>
        </div>
      </header>

      <main class="main-content">
        ${content}
      </main>

      <nav class="bottom-nav">
        ${nav.map(([id, ico, label]) => `
          <button class="nav-item ${currentPage === id ? "active" : ""}" data-page="${id}">
            <span>${ico}</span><small>${label}</small>
          </button>
        `).join("")}
      </nav>
    </div>
  `;
}

function pageHeader(eyebrow, title, subtitle = "", action = "") {
  return `
    <div class="page-header">
      <div>
        <div class="eyebrow">${esc(eyebrow)}</div>
        <h1>${esc(title)}</h1>
        ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
      </div>
      ${action}
    </div>
  `;
}

function statCard(value, label, tone = "") {
  return `<div class="stat-card ${tone}">
    <strong>${esc(value)}</strong>
    <span>${esc(label)}</span>
  </div>`;
}

function emptyState(title, text, actionLabel, action) {
  return `
    <div class="empty-state">
      <div class="empty-orb">✦</div>
      <h3>${esc(title)}</h3>
      <p>${esc(text)}</p>
      <button class="primary-button" data-action="${action}">${icon("plus")} ${esc(actionLabel)}</button>
    </div>
  `;
}

function home() {
  const pending = state.data.tarefas.filter((x) => !x.done).length;
  const commitments = state.data.compromissos.filter((x) => x.date === todayISO()).length;
  const goals = state.data.objetivos.length;
  const firstName = (state.user.name || "você").split(" ")[0];

  return appShell(`
    <section class="hero-card">
      <div class="hero-glow"></div>
      <div class="hero-copy">
        <span class="pill"><span class="pulse-dot"></span> Seu copiloto para a vida</span>
        <h1>Olá, ${esc(firstName)}.<br><span>Vamos organizar seu dia?</span></h1>
        <p>A LiDire reúne sua rotina em um só lugar para você saber o que importa agora.</p>
        <div class="hero-actions">
          <button class="primary-button" data-action="quick-add">${icon("plus")} Adicionar</button>
          <button class="ghost-button" data-page="explorar">Explorar LiDire ${icon("arrow")}</button>
        </div>
      </div>
      <div class="hero-orbit">
        <div class="orbit-center">L</div>
        <span>Agenda</span><span>Tarefas</span><span>Metas</span><span>Você</span>
      </div>
    </section>

    <section class="section">
      <div class="section-title">
        <div><span class="eyebrow">RESUMO</span><h2>Seu dia em números</h2></div>
      </div>
      <div class="stats-grid">
        ${statCard(commitments, "Hoje na agenda", "purple")}
        ${statCard(pending, "Tarefas pendentes", "cyan")}
        ${statCard(goals, "Objetivos ativos", "pink")}
      </div>
    </section>

    <section class="section">
      <div class="section-title">
        <div><span class="eyebrow">CENTRAL</span><h2>O que você quer organizar?</h2></div>
        <button class="text-button" data-page="explorar">Ver tudo ${icon("arrow")}</button>
      </div>
      <div class="module-grid">
        ${modules.slice(0, 6).map(moduleCard).join("")}
      </div>
    </section>

    <section class="assistant-banner">
      <div class="assistant-symbol">✦</div>
      <div>
        <span class="eyebrow">ASSISTENTE LIDIRE</span>
        <h3>Precisa de ajuda para decidir o próximo passo?</h3>
        <p>Converse com sua rotina e encontre o que precisa fazer agora.</p>
      </div>
      <button class="primary-button" data-page="assistente">Conversar ${icon("arrow")}</button>
    </section>
  `);
}

function moduleCard([id, title, desc, ico, page]) {
  const count = countFor(id);
  return `
    <button class="module-card" data-page="${page}">
      <span class="module-icon">${icon(ico)}</span>
      <span class="module-content">
        <strong>${esc(title)}</strong>
        <small>${esc(desc)}</small>
      </span>
      <span class="module-count">${count}</span>
      <span class="module-arrow">${icon("arrow")}</span>
    </button>
  `;
}

function countFor(id) {
  if (id === "tarefas") return state.data.tarefas.filter(x => !x.done).length;
  if (id === "agenda") return state.data.compromissos.length;
  if (id === "compras") return state.data.compras.filter(x => !x.done).length;
  return state.data[id]?.length || 0;
}

function listPage(config) {
  const items = state.data[config.key] || [];
  const visible = items;

  return appShell(`
    ${pageHeader(config.eyebrow || "ORGANIZAÇÃO", config.title, config.subtitle,
      `<button class="primary-button compact" data-action="add-${config.key}">${icon("plus")} Adicionar</button>`)}
    ${config.stats ? `<div class="stats-grid mini">${config.stats()}</div>` : ""}
    <div class="content-card">
      <div class="card-toolbar">
        <div class="toolbar-title">${visible.length} ${visible.length === 1 ? "item" : "itens"}</div>
        <div class="toolbar-filter">${config.filter || ""}</div>
      </div>
      ${visible.length ? `<div class="item-list">${visible.map(config.render).join("")}</div>` : emptyState(config.emptyTitle || "Nada por aqui ainda", config.emptyText || "Adicione seu primeiro item para começar.", "Adicionar", `add-${config.key}`)}
    </div>
  `);
}

function agenda() {
  const items = [...state.data.compromissos].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  return listPage({
    key: "compromissos",
    title: "Agenda",
    subtitle: "Seus compromissos organizados em um só lugar.",
    eyebrow: "SUA ROTINA",
    emptyTitle: "Sua agenda está livre",
    emptyText: "Cadastre compromissos, consultas, reuniões e outros horários.",
    render: (x) => `
      <div class="list-item">
        <div class="date-badge"><strong>${x.date ? x.date.slice(8,10) : "--"}</strong><small>${x.date ? new Date(`${x.date}T12:00:00`).toLocaleDateString("pt-BR",{month:"short"}).replace(".","") : ""}</small></div>
        <div class="item-main"><strong>${esc(x.title)}</strong><span>${x.time ? `◷ ${esc(x.time)}` : "Sem horário"}${x.location ? ` · ${esc(x.location)}` : ""}</span></div>
        <div class="item-actions"><button data-action="edit-compromisso" data-id="${x.id}">${icon("edit")}</button><button data-action="delete-compromisso" data-id="${x.id}">${icon("trash")}</button></div>
      </div>`
  });
}

function tarefas() {
  return listPage({
    key: "tarefas",
    title: "Tarefas",
    subtitle: "Tire as coisas da cabeça e coloque em movimento.",
    eyebrow: "FAZER",
    stats: () => {
      const all = state.data.tarefas.length;
      const done = state.data.tarefas.filter(x=>x.done).length;
      return `${statCard(done, "Concluídas", "cyan")}${statCard(all-done, "Pendentes", "purple")}${statCard(all ? Math.round(done/all*100)+"%" : "0%", "Progresso", "pink")}`;
    },
    emptyTitle: "Nenhuma tarefa criada",
    render: (x) => `
      <div class="list-item ${x.done ? "completed" : ""}">
        <button class="check-button ${x.done ? "checked" : ""}" data-action="toggle-tarefa" data-id="${x.id}">${x.done ? "✓" : ""}</button>
        <div class="item-main"><strong>${esc(x.title)}</strong><span>${x.priority ? `Prioridade: ${esc(x.priority)}` : "Sem prioridade"}${x.date ? ` · ${dateBR(x.date)}` : ""}</span></div>
        <div class="item-actions"><button data-action="edit-tarefa" data-id="${x.id}">${icon("edit")}</button><button data-action="delete-tarefa" data-id="${x.id}">${icon("trash")}</button></div>
      </div>`
  });
}

function compras() {
  return listPage({
    key: "compras",
    title: "Compras",
    subtitle: "Sua lista sempre à mão.",
    eyebrow: "LISTAS",
    emptyTitle: "Sua lista está vazia",
    render: (x) => `
      <div class="list-item ${x.done ? "completed" : ""}">
        <button class="check-button ${x.done ? "checked" : ""}" data-action="toggle-compra" data-id="${x.id}">${x.done ? "✓" : ""}</button>
        <div class="item-main"><strong>${esc(x.name)}</strong><span>${x.category ? esc(x.category) : "Sem categoria"}${x.quantity ? ` · ${esc(x.quantity)}` : ""}</span></div>
        <div class="item-actions"><button data-action="delete-compra" data-id="${x.id}">${icon("trash")}</button></div>
      </div>`
  });
}

function estudos() {
  return listPage({
    key: "estudos",
    title: "Estudos",
    subtitle: "Acompanhe matérias, sessões e seu progresso.",
    eyebrow: "APRENDIZADO",
    render: (x) => `
      <div class="list-item ${x.done ? "completed" : ""}">
        <button class="check-button ${x.done ? "checked" : ""}" data-action="toggle-estudo" data-id="${x.id}">${x.done ? "✓" : ""}</button>
        <div class="item-main"><strong>${esc(x.subject)}</strong><span>${x.topic ? esc(x.topic) : "Sessão de estudo"}${x.duration ? ` · ${esc(x.duration)} min` : ""}</span></div>
        <div class="item-actions"><button data-action="delete-estudo" data-id="${x.id}">${icon("trash")}</button></div>
      </div>`
  });
}

function treinos() {
  return listPage({
    key: "treinos",
    title: "Treinos",
    subtitle: "Registre seus movimentos e mantenha constância.",
    eyebrow: "BEM-ESTAR",
    render: (x) => `
      <div class="list-item">
        <div class="module-icon small">♢</div>
        <div class="item-main"><strong>${esc(x.name)}</strong><span>${x.type || "Treino"}${x.duration ? ` · ${esc(x.duration)} min` : ""}</span></div>
        <div class="item-actions"><button data-action="delete-treino" data-id="${x.id}">${icon("trash")}</button></div>
      </div>`
  });
}

function hidratacao() {
  const total = state.data.hidratacao.reduce((s,x)=>s+Number(x.amount||0),0);
  const goal = 2000;
  const pct = Math.min(100, Math.round(total/goal*100));
  return appShell(`
    ${pageHeader("BEM-ESTAR", "Hidratação", "Pequenos registros ajudam a cuidar da sua rotina.",
      `<button class="primary-button compact" data-action="add-hidratacao">${icon("plus")} Registrar</button>`)}
    <div class="hydration-card">
      <div class="hydration-top"><div><span class="eyebrow">HOJE</span><h2>${total} ml</h2><p>de ${goal} ml registrados</p></div><div class="water-drop">◉</div></div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="progress-labels"><span>0 ml</span><strong>${pct}%</strong><span>${goal} ml</span></div>
      <div class="quick-water">
        ${[200,300,500].map(v=>`<button data-action="quick-water" data-value="${v}">+${v} ml</button>`).join("")}
      </div>
    </div>
    <div class="content-card">
      <div class="card-toolbar"><div class="toolbar-title">Registros de hoje</div><button class="text-button" data-action="reset-hidratacao">Limpar</button></div>
      ${state.data.hidratacao.length ? `<div class="item-list">${state.data.hidratacao.map(x=>`
        <div class="list-item"><div class="module-icon small">◉</div><div class="item-main"><strong>${x.amount} ml</strong><span>${new Date(x.createdAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span></div><div class="item-actions"><button data-action="delete-hidratacao" data-id="${x.id}">${icon("trash")}</button></div></div>`).join("")}</div>` : `<p class="muted">Nenhum registro hoje.</p>`}
    </div>
  `);
}

function financas() {
  const income = state.data.financas.filter(x=>x.type==="income").reduce((s,x)=>s+Number(x.value),0);
  const expense = state.data.financas.filter(x=>x.type==="expense").reduce((s,x)=>s+Number(x.value),0);
  return listPage({
    key: "financas",
    title: "Finanças",
    subtitle: "Tenha uma visão simples do que entra e sai.",
    eyebrow: "DINHEIRO",
    stats: () => `${statCard(money(income), "Entradas", "cyan")}${statCard(money(expense), "Saídas", "pink")}${statCard(money(income-expense), "Saldo", "purple")}`,
    render: (x) => `
      <div class="list-item">
        <div class="finance-icon ${x.type}">${x.type==="income" ? "↑" : "↓"}</div>
        <div class="item-main"><strong>${esc(x.title)}</strong><span>${dateBR(x.date || todayISO())} · ${x.category ? esc(x.category) : "Geral"}</span></div>
        <strong class="finance-value ${x.type}">${x.type==="income" ? "+" : "-"} ${money(x.value)}</strong>
        <div class="item-actions"><button data-action="delete-financa" data-id="${x.id}">${icon("trash")}</button></div>
      </div>`,
    filter: `<button class="filter-button" data-action="add-financa">+ Entrada / saída</button>`
  });
}

function objetivos() {
  return listPage({
    key: "objetivos",
    title: "Objetivos",
    subtitle: "Dê forma aos planos que você quer realizar.",
    eyebrow: "DIREÇÃO",
    render: (x) => `
      <div class="goal-item">
        <div class="goal-top"><div><strong>${esc(x.title)}</strong><span>${x.deadline ? `Até ${dateBR(x.deadline)}` : "Sem prazo"}</span></div><b>${Number(x.progress||0)}%</b></div>
        <div class="progress"><span style="width:${Math.min(100,Number(x.progress||0))}%"></span></div>
        <div class="goal-actions"><button data-action="progress-objetivo" data-id="${x.id}">Atualizar progresso</button><button data-action="delete-objetivo" data-id="${x.id}">Excluir</button></div>
      </div>`
  });
}

function familia() {
  return listPage({
    key: "familia",
    title: "Família",
    subtitle: "Uma visão compartilhada para organizar a vida juntos.",
    eyebrow: "COMPARTILHAMENTO",
    emptyTitle: "Ainda não há pessoas adicionadas",
    emptyText: "Cadastre pessoas para estruturar sua área familiar. A sincronização online será conectada ao D1 em uma próxima etapa.",
    render: (x) => `<div class="list-item"><div class="avatar">${esc((x.name||"?").charAt(0).toUpperCase())}</div><div class="item-main"><strong>${esc(x.name)}</strong><span>${esc(x.relation || "Membro")}${x.email ? ` · ${esc(x.email)}` : ""}</span></div><div class="item-actions"><button data-action="delete-familia" data-id="${x.id}">${icon("trash")}</button></div></div>`
  });
}

function assistente() {
  const pending = state.data.tarefas.filter(x=>!x.done);
  const today = state.data.compromissos.filter(x=>x.date===todayISO());
  return appShell(`
    ${pageHeader("INTELIGÊNCIA", "Assistente LiDire", "Uma visão rápida da sua rotina para ajudar você a encontrar o próximo passo.")}
    <div class="assistant-screen">
      <div class="assistant-avatar">✦</div>
      <h2>Como posso ajudar?</h2>
      <p>Experimente uma das sugestões abaixo.</p>
      <div class="suggestions">
        <button data-action="assistant-question" data-question="O que tenho para hoje?">O que tenho para hoje?</button>
        <button data-action="assistant-question" data-question="Quais tarefas estão pendentes?">Quais tarefas estão pendentes?</button>
        <button data-action="assistant-question" data-question="Como está minha rotina?">Como está minha rotina?</button>
      </div>
      <div id="assistant-response" class="assistant-response">
        <strong>Resumo atual</strong>
        <p>Você tem <b>${pending.length}</b> tarefa(s) pendente(s) e <b>${today.length}</b> compromisso(s) hoje.</p>
      </div>
    </div>
  `);
}

function explorar() {
  return appShell(`
    ${pageHeader("LIDIRE", "Tudo em um só lugar", "Conheça os espaços que ajudam a transformar rotina em clareza.")}
    <div class="explore-grid">${modules.map(moduleCard).join("")}
      <button class="module-card featured" data-page="assistente">
        <span class="module-icon">✦</span><span class="module-content"><strong>Assistente LiDire</strong><small>Seu copiloto para organizar a rotina.</small></span><span class="module-arrow">${icon("arrow")}</span>
      </button>
    </div>
  `);
}

function perfil() {
  return appShell(`
    ${pageHeader("MINHA CONTA", "Perfil", "Personalize sua experiência na LiDire.")}
    <div class="profile-card">
      <div class="profile-avatar">${esc((state.user.name||"A").charAt(0).toUpperCase())}</div>
      <h2>${esc(state.user.name || "Seu nome")}</h2>
      <p>${esc(state.user.email || "Adicione seu e-mail")}</p>
      <button class="primary-button" data-action="edit-profile">${icon("edit")} Editar perfil</button>
    </div>
    <div class="settings-card">
      <button data-action="edit-profile"><span>✎</span><div><strong>Dados pessoais</strong><small>Nome, e-mail, idade e telefone</small></div>${icon("arrow")}</button>
      <button data-action="clear-local"><span>↺</span><div><strong>Redefinir dados locais</strong><small>Apaga os dados salvos neste dispositivo</small></div>${icon("arrow")}</button>
    </div>
  `);
}

const pages = { inicio: home, agenda, tarefas, compras, estudos, treinos, hidratacao, financas, objetivos, familia, assistente, explorar, perfil };

function render() {
  const root = document.getElementById("app");
  root.innerHTML = (pages[currentPage] || home)();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openModal(title, body, options = {}) {
  closeModal();
  modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header"><div><span class="eyebrow">${esc(options.eyebrow || "LIDIRE")}</span><h2>${esc(title)}</h2></div><button class="modal-close" data-action="close-modal">×</button></div>
      <form id="lidire-form" class="form-grid">${body}<div class="modal-footer"><button type="button" class="ghost-button" data-action="close-modal">Cancelar</button><button class="primary-button" type="submit">${esc(options.submit || "Salvar")}</button></div></form>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("input, select, textarea")?.focus();
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.remove();
  modal = null;
}

function field(label, name, type = "text", value = "", extra = "") {
  return `<label class="form-field"><span>${esc(label)}</span><input name="${esc(name)}" type="${type}" value="${esc(value)}" ${extra}></label>`;
}

function addForm(key) {
  if (key === "compromissos") {
    openModal("Novo compromisso", `${field("Título","title","text","", "required")}${field("Data","date","date",todayISO(),"required")}${field("Horário","time")}${field("Local","location")}`, {submit:"Adicionar"});
    modal.querySelector("#lidire-form").onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target);
      state.data.compromissos.push({id:uid("c"),title:f.get("title"),date:f.get("date"),time:f.get("time"),location:f.get("location")});
      saveState(); closeModal(); render(); toast("Compromisso adicionado.");
    };
  } else if (key === "tarefas") {
    openModal("Nova tarefa", `${field("Tarefa","title","text","", "required")}<label class="form-field"><span>Prioridade</span><select name="priority"><option value="">Normal</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label>${field("Prazo","date")}`, {submit:"Adicionar"});
    modal.querySelector("#lidire-form").onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target);
      state.data.tarefas.push({id:uid("t"),title:f.get("title"),priority:f.get("priority"),date:f.get("date"),done:false});
      saveState(); closeModal(); render(); toast("Tarefa adicionada.");
    };
  } else if (key === "compras") {
    openModal("Novo item", `${field("Item","name","text","", "required")}${field("Quantidade","quantity")}${field("Categoria","category")}`, {submit:"Adicionar"});
    modal.querySelector("#lidire-form").onsubmit = e => { const f=new FormData(e.target); state.data.compras.push({id:uid("p"),name:f.get("name"),quantity:f.get("quantity"),category:f.get("category"),done:false}); saveState(); closeModal(); render(); toast("Item adicionado."); };
  } else if (key === "estudos") {
    openModal("Nova sessão de estudo", `${field("Matéria","subject","text","", "required")}${field("Tema","topic")}${field("Duração (min)","duration","number")}`, {submit:"Registrar"});
    modal.querySelector("#lidire-form").onsubmit = e => { const f=new FormData(e.target); state.data.estudos.push({id:uid("e"),subject:f.get("subject"),topic:f.get("topic"),duration:f.get("duration"),done:false}); saveState(); closeModal(); render(); toast("Estudo registrado."); };
  } else if (key === "treinos") {
    openModal("Novo treino", `${field("Nome","name","text","", "required")}${field("Tipo","type")}${field("Duração (min)","duration","number")}`, {submit:"Registrar"});
    modal.querySelector("#lidire-form").onsubmit = e => { const f=new FormData(e.target); state.data.treinos.push({id:uid("tr"),name:f.get("name"),type:f.get("type"),duration:f.get("duration")}); saveState(); closeModal(); render(); toast("Treino registrado."); };
  } else if (key === "hidratacao") {
    openModal("Registrar água", `${field("Quantidade (ml)","amount","number","300","required")}`, {submit:"Registrar"});
    modal.querySelector("#lidire-form").onsubmit = e => { const f=new FormData(e.target); state.data.hidratacao.push({id:uid("h"),amount:Number(f.get("amount")),createdAt:new Date().toISOString()}); saveState(); closeModal(); render(); toast("Hidratação registrada."); };
  } else if (key === "financas") {
    openModal("Novo lançamento", `<label class="form-field"><span>Tipo</span><select name="type"><option value="expense">Saída</option><option value="income">Entrada</option></select></label>${field("Descrição","title","text","", "required")}${field("Valor","value","number","","step=\"0.01\" min=\"0\" required")}${field("Categoria","category")}${field("Data","date","date",todayISO())}`, {submit:"Salvar"});
    modal.querySelector("#lidire-form").onsubmit = e => { const f=new FormData(e.target); state.data.financas.push({id:uid("f"),type:f.get("type"),title:f.get("title"),value:Number(f.get("value")),category:f.get("category"),date:f.get("date")}); saveState(); closeModal(); render(); toast("Lançamento salvo."); };
  } else if (key === "objetivos") {
    openModal("Novo objetivo", `${field("Objetivo","title","text","", "required")}${field("Prazo","deadline","date")}${field("Progresso (%)","progress","number","0","min=\"0\" max=\"100\"")}`, {submit:"Criar objetivo"});
    modal.querySelector("#lidire-form").onsubmit = e => { const f=new FormData(e.target); state.data.objetivos.push({id:uid("o"),title:f.get("title"),deadline:f.get("deadline"),progress:Number(f.get("progress")||0)}); saveState(); closeModal(); render(); toast("Objetivo criado."); };
  } else if (key === "familia") {
    openModal("Adicionar pessoa", `${field("Nome","name","text","", "required")}${field("Relação","relation")}${field("E-mail","email","email")}`, {submit:"Adicionar"});
    modal.querySelector("#lidire-form").onsubmit = e => { const f=new FormData(e.target); state.data.familia.push({id:uid("m"),name:f.get("name"),relation:f.get("relation"),email:f.get("email")}); saveState(); closeModal(); render(); toast("Pessoa adicionada."); };
  }
}

function editItem(type, id) {
  const key = type === "compromisso" ? "compromissos" : "tarefas";
  const item = state.data[key].find(x => x.id === id);
  if (!item) return;

  if (type === "compromisso") {
    openModal("Editar compromisso", `${field("Título","title","text",item.title,"required")}${field("Data","date","date",item.date,"required")}${field("Horário","time","time",item.time||"")}${field("Local","location","text",item.location||"")}`, {submit:"Salvar"});
  } else {
    openModal("Editar tarefa", `${field("Tarefa","title","text",item.title,"required")}<label class="form-field"><span>Prioridade</span><select name="priority"><option ${item.priority===""?"selected":""}>Normal</option><option ${item.priority==="Alta"?"selected":""}>Alta</option><option ${item.priority==="Média"?"selected":""}>Média</option><option ${item.priority==="Baixa"?"selected":""}>Baixa</option></select></label>${field("Prazo","date","date",item.date||"")}`, {submit:"Salvar"});
  }

  modal.querySelector("#lidire-form").onsubmit = e => {
    e.preventDefault(); const f=new FormData(e.target); Object.assign(item, Object.fromEntries(f.entries())); saveState(); closeModal(); render(); toast("Alterações salvas.");
  };
}

function removeItem(key, id, message = "Item removido.") {
  state.data[key] = state.data[key].filter(x => x.id !== id);
  saveState(); render(); toast(message);
}

function handleAction(action, el) {
  if (action === "quick-add") {
    openModal("O que você quer adicionar?", `
      <div class="quick-actions">
        ${[
          ["compromissos","▣","Compromisso"],["tarefas","✓","Tarefa"],["compras","🛒","Compra"],
          ["estudos","▤","Estudo"],["treinos","♢","Treino"],["hidratacao","◉","Água"],
          ["financas","R$","Finança"],["objetivos","◎","Objetivo"],["familia","♧","Pessoa"]
        ].map(x=>`<button type="button" class="quick-option" data-action="quick-option" data-key="${x[0]}"><span>${x[1]}</span>${x[2]}</button>`).join("")}
      </div>`, {submit:"Fechar"});
    modal.querySelector(".modal-footer").style.display = "none";
    return;
  }
  if (action === "quick-option") { const key=el.dataset.key; closeModal(); addForm(key); return; }
  if (action === "close-modal") { closeModal(); return; }
  if (action.startsWith("add-")) { addForm(action.slice(4)); return; }

  const id = el.dataset.id;
  if (action === "toggle-tarefa") { const x=state.data.tarefas.find(i=>i.id===id); if(x)x.done=!x.done; saveState(); render(); return; }
  if (action === "toggle-compra") { const x=state.data.compras.find(i=>i.id===id); if(x)x.done=!x.done; saveState(); render(); return; }
  if (action === "toggle-estudo") { const x=state.data.estudos.find(i=>i.id===id); if(x)x.done=!x.done; saveState(); render(); return; }
  if (action === "edit-compromisso") { editItem("compromisso", id); return; }
  if (action === "edit-tarefa") { editItem("tarefa", id); return; }

  const deletes = {
    "delete-compromisso":["compromissos","Compromisso removido."],
    "delete-tarefa":["tarefas","Tarefa removida."],
    "delete-compra":["compras","Item removido."],
    "delete-estudo":["estudos","Registro removido."],
    "delete-treino":["treinos","Treino removido."],
    "delete-hidratacao":["hidratacao","Registro removido."],
    "delete-financa":["financas","Lançamento removido."],
    "delete-objetivo":["objetivos","Objetivo removido."],
    "delete-familia":["familia","Pessoa removida."]
  };
  if (deletes[action]) { removeItem(...deletes[action], id); return; }

  if (action === "quick-water") {
    state.data.hidratacao.push({id:uid("h"),amount:Number(el.dataset.value),createdAt:new Date().toISOString()});
    saveState(); render(); toast(`+${el.dataset.value} ml registrados.`);
    return;
  }
  if (action === "reset-hidratacao") {
    if (confirm("Limpar todos os registros de hidratação?")) { state.data.hidratacao=[]; saveState(); render(); toast("Registros limpos."); }
    return;
  }
  if (action === "progress-objetivo") {
    const item=state.data.objetivos.find(x=>x.id===id); if(!item)return;
    openModal("Atualizar progresso", `${field("Progresso (%)","progress","number",item.progress,"min=\"0\" max=\"100\" required")}`, {submit:"Atualizar"});
    modal.querySelector("#lidire-form").onsubmit=e=>{e.preventDefault();item.progress=Number(new FormData(e.target).get("progress"));saveState();closeModal();render();toast("Progresso atualizado.");};
    return;
  }
  if (action === "assistant-question") {
    const q = el.dataset.question;
    const response = q.includes("hoje") ? `Hoje você tem ${state.data.compromissos.filter(x=>x.date===todayISO()).length} compromisso(s) na agenda e ${state.data.tarefas.filter(x=>!x.done).length} tarefa(s) pendente(s).`
      : q.includes("pendentes") ? `Você tem ${state.data.tarefas.filter(x=>!x.done).map(x=>x.title).join(", ") || "nenhuma tarefa pendente"}.`
      : `Sua rotina tem ${state.data.tarefas.filter(x=>!x.done).length} tarefa(s) pendente(s), ${state.data.objetivos.length} objetivo(s) e ${state.data.compras.filter(x=>!x.done).length} item(ns) na lista de compras.`;
    const box=document.getElementById("assistant-response"); if(box)box.innerHTML=`<strong>LiDire</strong><p>${esc(response)}</p>`;
    return;
  }
  if (action === "edit-profile") {
    openModal("Editar perfil", `${field("Nome","name","text",state.user.name,"required")}${field("E-mail","email","email",state.user.email||"")}${field("Idade","age","number",state.user.age||"")}${field("Telefone","phone","tel",state.user.phone||"")}`, {submit:"Salvar perfil"});
    modal.querySelector("#lidire-form").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.user={...state.user,...Object.fromEntries(f.entries())};saveState();closeModal();render();toast("Perfil atualizado.");};
    return;
  }
  if (action === "clear-local") {
    if (confirm("Isso apagará os dados salvos neste dispositivo. Continuar?")) {
      state=structuredClone(defaultState); saveState(); render(); toast("Dados locais redefinidos.");
    }
  }
}

document.addEventListener("click", (event) => {
  const pageEl = event.target.closest("[data-page]");
  if (pageEl) {
    event.preventDefault();
    currentPage = pageEl.dataset.page;
    render();
    return;
  }
  const actionEl = event.target.closest("[data-action]");
  if (actionEl) {
    event.preventDefault();
    handleAction(actionEl.dataset.action, actionEl);
  }
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal-backdrop")) closeModal();
});

window.LiDire = {
  state: () => state,
  save: saveState,
  go: (page) => { currentPage = page; render(); }
};

document.addEventListener("DOMContentLoaded", render);
