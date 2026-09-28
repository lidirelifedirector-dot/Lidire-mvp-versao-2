const STORAGE_KEY = "lidire-mvp-data";

const defaultState = {
  user: {
    name: "Alice",
    email: "conta@lidire.com",
    age: "",
    phone: "",
    photo: ""
  },

  data: {
    compromissos: [],
    tarefas: [],
    compras: [],
    estudos: [],
    treinos: [],
    hidratacao: [],
    hidratacaoConfig: {
      amountPerPeriod: 300,
      intervalMinutes: 120,
      startTime: "08:00",
      endTime: "20:00"
    },
    alimentacao: [],
    alimentacaoConfig: {
      dailyCalories: 2000
    },
    financas: [],
    objetivos: [],
    familia: []
  }
};

let state = loadState();
let currentPage = "inicio";
let currentShoppingList = null;
let modal = null;

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      return cloneDefaultState();
    }

    return {
      ...cloneDefaultState(),
      ...saved,

      user: {
        ...defaultState.user,
        ...(saved.user || {})
      },

      data: {
        ...defaultState.data,
        ...(saved.data || {}),

        hidratacaoConfig: {
          ...defaultState.data.hidratacaoConfig,
          ...((saved.data || {}).hidratacaoConfig || {})
        },

        alimentacaoConfig: {
          ...defaultState.data.alimentacaoConfig,
          ...((saved.data || {}).alimentacaoConfig || {})
        }
      }
    };
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return cloneDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
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

  const [y, m, d] = String(value).split("-");

  return y && m && d ? `${d}/${m}/${y}` : value;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toast(message, type = "success") {
  document.querySelectorAll(".lidire-toast").forEach((el) => el.remove());

  const el = document.createElement("div");

  el.className = `lidire-toast ${type}`;

  el.innerHTML = `
    <span>${type === "success" ? "✓" : "!"}</span>
    ${esc(message)}
  `;

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
    food: "🍽️",
    spark: "✦",
    user: "◯",
    plus: "+",
    arrow: "→",
    trash: "⌫",
    edit: "✎",
    clock: "◷",
    search: "⌕",
    back: "‹",
    camera: "📷"
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
  ["alimentacao", "Alimentação", "Refeições e calorias", "food", "alimentacao"],
  ["financas", "Finanças", "Entradas e gastos", "wallet", "financas"],
  ["objetivos", "Objetivos", "Transforme planos em passos", "target", "objetivos"],
  ["familia", "Família", "Compartilhe sua rotina", "family", "familia"]
];

function appShell(content) {
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

        <button
          class="brand"
          data-page="inicio"
          aria-label="Ir para início"
        >
          <img
            src="/logo-lidire-oficial.png"
            alt="LiDire"
          >

          <span>LiDire</span>
        </button>

        <div class="topbar-actions">

          <button
            class="icon-button"
            data-action="quick-add"
            title="Adicionar"
          >
            ${icon("plus")}
          </button>

          <button
            class="avatar"
            data-page="perfil"
          >
            ${
              state.user.photo
                ? `<img src="${esc(state.user.photo)}" alt="Foto de perfil">`
                : esc(
                    (state.user.name || "A")
                      .charAt(0)
                      .toUpperCase()
                  )
            }
          </button>

        </div>

      </header>

      <main class="main-content">
        ${content}
      </main>

      <nav class="bottom-nav">

        ${nav
          .map(
            ([id, ico, label]) => `
              <button
                class="nav-item ${
                  currentPage === id ? "active" : ""
                }"
                data-page="${id}"
              >
                <span>${ico}</span>
                <small>${label}</small>
              </button>
            `
          )
          .join("")}

      </nav>

    </div>
  `;
}

function pageHeader(
  eyebrow,
  title,
  subtitle = "",
  action = ""
) {
  return `
    <div class="page-header">

      <div>

        <div class="eyebrow">
          ${esc(eyebrow)}
        </div>

        <h1>
          ${esc(title)}
        </h1>

        ${
          subtitle
            ? `<p>${esc(subtitle)}</p>`
            : ""
        }

      </div>

      ${action}

    </div>
  `;
}

function statCard(value, label, tone = "") {
  return `
    <div class="stat-card ${tone}">
      <strong>${esc(value)}</strong>
      <span>${esc(label)}</span>
    </div>
  `;
}

function emptyState(
  title,
  text,
  actionLabel,
  action
) {
  return `
    <div class="empty-state">

      <div class="empty-orb">
        ✦
      </div>

      <h3>
        ${esc(title)}
      </h3>

      <p>
        ${esc(text)}
      </p>

      <button
        class="primary-button"
        data-action="${esc(action)}"
      >
        ${icon("plus")}
        ${esc(actionLabel)}
      </button>

    </div>
  `;
}

function field(
  label,
  name,
  type = "text",
  value = "",
  extra = ""
) {
  return `
    <label class="form-field">

      <span>
        ${esc(label)}
      </span>

      <input
        name="${esc(name)}"
        type="${esc(type)}"
        value="${esc(value)}"
        ${extra}
      >

    </label>
  `;
}

function selectField(
  label,
  name,
  options,
  selected = ""
) {
  return `
    <label class="form-field">

      <span>
        ${esc(label)}
      </span>

      <select name="${esc(name)}">

        ${options
          .map(
            (option) => `
              <option
                value="${esc(option.value)}"
                ${
                  String(option.value) ===
                  String(selected)
                    ? "selected"
                    : ""
                }
              >
                ${esc(option.label)}
              </option>
            `
          )
          .join("")}

      </select>

    </label>
  `;
      }
