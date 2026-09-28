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

function home() {
  const pending = state.data.tarefas.filter(
    (x) => !x.done
  ).length;

  const commitments =
    state.data.compromissos.filter(
      (x) => x.date === todayISO()
    ).length;

  const goals = state.data.objetivos.length;

  const firstName = (
    state.user.name || "você"
  ).split(" ")[0];

  return appShell(`
    <section class="hero-card">

      <div class="hero-glow"></div>

      <div class="hero-copy">

        <span class="pill">
          <span class="pulse-dot"></span>
          Seu copiloto para a vida
        </span>

        <h1>
          Olá, ${esc(firstName)}.<br>
          <span>Vamos organizar seu dia?</span>
        </h1>

        <p>
          A LiDire reúne sua rotina em um só lugar
          para você saber o que importa agora.
        </p>

        <div class="hero-actions">

          <button
            class="primary-button"
            data-action="quick-add"
          >
            ${icon("plus")}
            Adicionar
          </button>

          <button
            class="ghost-button"
            data-page="explorar"
          >
            Explorar LiDire
            ${icon("arrow")}
          </button>

        </div>

      </div>

      <div class="hero-orbit">

        <div class="orbit-center">

          <img
            src="/logo-lidire-oficial.png"
            alt="LiDire"
          >

        </div>

        <span>Agenda</span>
        <span>Tarefas</span>
        <span>Metas</span>
        <span>Você</span>

      </div>

    </section>

    <section class="section">

      <div class="section-title">

        <div>
          <span class="eyebrow">
            RESUMO
          </span>

          <h2>
            Seu dia em números
          </h2>
        </div>

      </div>

      <div class="stats-grid">

        ${statCard(
          commitments,
          "Hoje na agenda",
          "purple"
        )}

        ${statCard(
          pending,
          "Tarefas pendentes",
          "cyan"
        )}

        ${statCard(
          goals,
          "Objetivos ativos",
          "pink"
        )}

      </div>

    </section>

    <section class="section">

      <div class="section-title">

        <div>
          <span class="eyebrow">
            CENTRAL
          </span>

          <h2>
            O que você quer organizar?
          </h2>
        </div>

        <button
          class="text-button"
          data-page="explorar"
        >
          Ver tudo ${icon("arrow")}
        </button>

      </div>

      <div class="module-grid">
        ${modules
          .slice(0, 6)
          .map(moduleCard)
          .join("")}
      </div>

    </section>

    <section class="assistant-banner">

      <div class="assistant-symbol">
        ✦
      </div>

      <div>

        <span class="eyebrow">
          ASSISTENTE LIDIRE
        </span>

        <h3>
          Precisa de ajuda para decidir
          o próximo passo?
        </h3>

        <p>
          Converse com sua rotina e encontre
          o que precisa fazer agora.
        </p>

      </div>

      <button
        class="primary-button"
        data-page="assistente"
      >
        Conversar ${icon("arrow")}
      </button>

    </section>
  `);
}

function moduleCard([
  id,
  title,
  desc,
  ico,
  page
]) {
  const count = countFor(id);

  return `
    <button
      class="module-card"
      data-page="${page}"
    >

      <span class="module-icon">
        ${icon(ico)}
      </span>

      <span class="module-content">

        <strong>
          ${esc(title)}
        </strong>

        <small>
          ${esc(desc)}
        </small>

      </span>

      <span class="module-count">
        ${count}
      </span>

      <span class="module-arrow">
        ${icon("arrow")}
      </span>

    </button>
  `;
}

function countFor(id) {
  if (id === "tarefas") {
    return state.data.tarefas.filter(
      (x) => !x.done
    ).length;
  }

  if (id === "agenda") {
    return state.data.compromissos.length;
  }

  if (id === "compras") {
    return state.data.compras.reduce(
      (total, lista) =>
        total +
        (lista.items || []).filter(
          (x) => !x.done
        ).length,
      0
    );
  }

  return state.data[id]?.length || 0;
}

function listPage(config) {
  const items =
    state.data[config.key] || [];

  return appShell(`
    ${pageHeader(
      config.eyebrow || "ORGANIZAÇÃO",
      config.title,
      config.subtitle,
      `
        <button
          class="primary-button compact"
          data-action="add-${config.key}"
        >
          ${icon("plus")}
          Adicionar
        </button>
      `
    )}

    ${
      config.stats
        ? `
          <div class="stats-grid mini">
            ${config.stats()}
          </div>
        `
        : ""
    }

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          ${items.length}
          ${items.length === 1 ? "item" : "itens"}
        </div>

        <div class="toolbar-filter">
          ${config.filter || ""}
        </div>

      </div>

      ${
        items.length
          ? `
            <div class="item-list">
              ${items
                .map(config.render)
                .join("")}
            </div>
          `
          : emptyState(
              config.emptyTitle ||
                "Nada por aqui ainda",
              config.emptyText ||
                "Adicione seu primeiro item para começar.",
              "Adicionar",
              `add-${config.key}`
            )
      }

    </div>
  `);
}

function agenda() {
  const items = [
    ...state.data.compromissos
  ].sort((a, b) => {
    const dateA = `${a.date || ""} ${
      a.time || ""
    }`;

    const dateB = `${b.date || ""} ${
      b.time || ""
    }`;

    return dateA.localeCompare(dateB);
  });

  return listPage({
    key: "compromissos",

    title: "Agenda",

    subtitle:
      "Seus compromissos organizados em um só lugar.",

    eyebrow: "SUA ROTINA",

    emptyTitle:
      "Sua agenda está livre",

    emptyText:
      "Cadastre compromissos, consultas, reuniões e outros horários.",

    render: (x) => `
      <div class="list-item">

        <div class="date-badge">

          <strong>
            ${
              x.date
                ? x.date.slice(8, 10)
                : "--"
            }
          </strong>

          <small>
            ${
              x.date
                ? new Date(
                    `${x.date}T12:00:00`
                  )
                    .toLocaleDateString(
                      "pt-BR",
                      { month: "short" }
                    )
                    .replace(".", "")
                : ""
            }
          </small>

        </div>

        <div class="item-main">

          <strong>
            ${esc(x.title)}
          </strong>

          <span>
            ${
              x.time
                ? `${icon("clock")} ${esc(
                    x.time
                  )}`
                : "Sem horário"
            }

            ${
              x.location
                ? ` · ${esc(x.location)}`
                : ""
            }
          </span>

        </div>

        <div class="item-actions">

          <button
            data-action="edit-compromisso"
            data-id="${x.id}"
          >
            ${icon("edit")}
          </button>

          <button
            data-action="delete-compromisso"
            data-id="${x.id}"
          >
            ${icon("trash")}
          </button>

        </div>

      </div>
    `
  });
}

function tarefas() {
  return listPage({
    key: "tarefas",

    title: "Tarefas",

    subtitle:
      "Tire as coisas da cabeça e coloque em movimento.",

    eyebrow: "FAZER",

    stats: () => {
      const all =
        state.data.tarefas.length;

      const done =
        state.data.tarefas.filter(
          (x) => x.done
        ).length;

      return `
        ${statCard(
          done,
          "Concluídas",
          "cyan"
        )}

        ${statCard(
          all - done,
          "Pendentes",
          "purple"
        )}

        ${statCard(
          all
            ? Math.round(
                (done / all) * 100
              ) + "%"
            : "0%",
          "Progresso",
          "pink"
        )}
      `;
    },

    emptyTitle:
      "Nenhuma tarefa criada",

    render: (x) => `
      <div class="list-item ${
        x.done ? "completed" : ""
      }">

        <button
          class="check-button ${
            x.done ? "checked" : ""
          }"
          data-action="toggle-tarefa"
          data-id="${x.id}"
        >
          ${x.done ? "✓" : ""}
        </button>

        <div class="item-main">

          <strong>
            ${esc(x.title)}
          </strong>

          <span>
            ${
              x.priority
                ? `Prioridade: ${esc(
                    x.priority
                  )}`
                : "Sem prioridade"
            }

            ${
              x.date
                ? ` · ${dateBR(x.date)}`
                : ""
            }
          </span>

        </div>

        <div class="item-actions">

          <button
            data-action="edit-tarefa"
            data-id="${x.id}"
          >
            ${icon("edit")}
          </button>

          <button
            data-action="delete-tarefa"
            data-id="${x.id}"
          >
            ${icon("trash")}
          </button>

        </div>

      </div>
    `
  });
}

function compras() {
  const listas =
    state.data.compras || [];

  return appShell(`
    ${pageHeader(
      "LISTAS",
      "Compras",
      "Organize suas compras em listas diferentes.",
      `
        <button
          class="primary-button compact"
          data-action="add-lista-compras"
        >
          ${icon("plus")}
          Nova lista
        </button>
      `
    )}

    <div class="shopping-lists">

      ${
        listas.length
          ? listas
              .map((lista) => {
                const total =
                  lista.items?.length || 0;

                const done =
                  lista.items?.filter(
                    (item) => item.done
                  ).length || 0;

                return `
                  <div class="shopping-list-card">

                    <button
                      class="shopping-list-main"
                      data-action="open-lista-compras"
                      data-id="${lista.id}"
                    >

                      <div class="shopping-list-icon">
                        🛒
                      </div>

                      <div class="shopping-list-info">

                        <strong>
                          ${esc(lista.name)}
                        </strong>

                        <span>
                          ${total}
                          ${
                            total === 1
                              ? "item"
                              : "itens"
                          }

                          ·

                          ${done}
                          ${
                            done === 1
                              ? "concluído"
                              : "concluídos"
                          }
                        </span>

                      </div>

                      <span class="module-arrow">
                        ${icon("arrow")}
                      </span>

                    </button>

                    <button
                      class="shopping-list-delete"
                      data-action="delete-lista-compras"
                      data-id="${lista.id}"
                      title="Excluir lista"
                    >
                      ${icon("trash")}
                    </button>

                  </div>
                `;
              })
              .join("")
          : `
            <div class="content-card">

              ${emptyState(
                "Nenhuma lista criada",
                "Crie sua primeira lista de compras para começar a organizar seus itens.",
                "Criar lista",
                "add-lista-compras"
              )}

            </div>
          `
      }

    </div>
  `);
}

function listaCompras(id) {
  const lista =
    state.data.compras.find(
      (x) => x.id === id
    );

  if (!lista) {
    currentPage = "compras";
    currentShoppingList = null;
    render();
    return;
  }

  const items =
    lista.items || [];

  const done =
    items.filter(
      (x) => x.done
    ).length;

  return appShell(`
    <div class="shopping-back">

      <button
        class="text-button"
        data-action="back-compras"
      >
        ${icon("back")}
        Voltar para compras
      </button>

    </div>

    ${pageHeader(
      "LISTA DE COMPRAS",
      lista.name,
      `${items.length} ${
        items.length === 1
          ? "item"
          : "itens"
      } · ${done} concluído${
        done === 1 ? "" : "s"
      }`,
      `
        <button
          class="primary-button compact"
          data-action="add-item-compra"
          data-id="${lista.id}"
        >
          ${icon("plus")}
          Adicionar item
        </button>
      `
    )}

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          ${done}/${items.length}
          concluídos
        </div>

      </div>

      ${
        items.length
          ? `
            <div class="item-list">

              ${items
                .map(
                  (item) => `
                    <div class="list-item ${
                      item.done
                        ? "completed"
                        : ""
                    }">

                      <button
                        class="check-button ${
                          item.done
                            ? "checked"
                            : ""
                        }"
                        data-action="toggle-item-compra"
                        data-list-id="${lista.id}"
                        data-id="${item.id}"
                      >
                        ${
                          item.done
                            ? "✓"
                            : ""
                        }
                      </button>

                      <div class="item-main">

                        <strong>
                          ${esc(item.name)}
                        </strong>

                        <span>

                          ${
                            item.quantity
                              ? esc(
                                  item.quantity
                                )
                              : ""
                          }

                          ${
                            item.category
                              ? ` · ${esc(
                                  item.category
                                )}`
                              : ""
                          }

                        </span>

                      </div>

                      <div class="item-actions">

                        <button
                          data-action="edit-item-compra"
                          data-list-id="${lista.id}"
                          data-id="${item.id}"
                        >
                          ${icon("edit")}
                        </button>

                        <button
                          data-action="delete-item-compra"
                          data-list-id="${lista.id}"
                          data-id="${item.id}"
                        >
                          ${icon("trash")}
                        </button>

                      </div>

                    </div>
                  `
                )
                .join("")}

            </div>
          `
          : `
            <div class="empty-state">

              <div class="empty-orb">
                🛒
              </div>

              <h3>
                Lista vazia
              </h3>

              <p>
                Adicione o primeiro item desta lista.
              </p>

              <button
                class="primary-button"
                data-action="add-item-compra"
                data-id="${lista.id}"
              >
                ${icon("plus")}
                Adicionar item
              </button>

            </div>
          `
      }

    </div>
  `);
}

function estudos() {
  return listPage({
    key: "estudos",

    title: "Estudos",

    subtitle:
      "Acompanhe matérias, sessões e seu progresso.",

    eyebrow: "APRENDIZADO",

    render: (x) => `
      <div class="list-item ${
        x.done ? "completed" : ""
      }">

        <button
          class="check-button ${
            x.done ? "checked" : ""
          }"
          data-action="toggle-estudo"
          data-id="${x.id}"
        >
          ${x.done ? "✓" : ""}
        </button>

        <div class="item-main">

          <strong>
            ${esc(x.subject)}
          </strong>

          <span>

            ${
              x.topic
                ? esc(x.topic)
                : "Sessão de estudo"
            }

            ${
              x.duration
                ? ` · ${esc(
                    x.duration
                  )} min`
                : ""
            }

          </span>

        </div>

        <div class="item-actions">

          <button
            data-action="edit-estudo"
            data-id="${x.id}"
          >
            ${icon("edit")}
          </button>

          <button
            data-action="delete-estudo"
            data-id="${x.id}"
          >
            ${icon("trash")}
          </button>

        </div>

      </div>
    `
  });
}

function treinos() {
  return listPage({
    key: "treinos",

    title: "Treinos",

    subtitle:
      "Registre seus movimentos e mantenha constância.",

    eyebrow: "BEM-ESTAR",

    render: (x) => `
      <div class="list-item">

        <div class="module-icon small">
          ♢
        </div>

        <div class="item-main">

          <strong>
            ${esc(x.name)}
          </strong>

          <span>

            ${esc(x.type || "Treino")}

            ${
              x.duration
                ? ` · ${esc(
                    x.duration
                  )} min`
                : ""
            }

          </span>

        </div>

        <div class="item-actions">

          <button
            data-action="edit-treino"
            data-id="${x.id}"
          >
            ${icon("edit")}
          </button>

          <button
            data-action="delete-treino"
            data-id="${x.id}"
          >
            ${icon("trash")}
          </button>

        </div>

      </div>
    `
  });
}

/* =========================================================
   HIDRATAÇÃO
   ========================================================= */

function getHydrationTotalToday() {
  return state.data.hidratacao
    .filter((x) => {
      return String(x.createdAt || "").slice(
        0,
        10
      ) === todayISO();
    })
    .reduce(
      (sum, x) =>
        sum + Number(x.amount || 0),
      0
    );
}

function getHydrationDailyGoal() {
  const config =
    state.data.hidratacaoConfig;

  const amount =
    Number(config.amountPerPeriod || 0);

  const start = timeToMinutes(
    config.startTime
  );

  const end = timeToMinutes(
    config.endTime
  );

  const interval =
    Number(config.intervalMinutes || 0);

  if (
    !amount ||
    !interval ||
    end <= start
  ) {
    return amount;
  }

  const periods =
    Math.floor(
      (end - start) / interval
    ) + 1;

  return amount * periods;
}

function timeToMinutes(time) {
  if (!time) return 0;

  const [hours, minutes] =
    time.split(":").map(Number);

  return (
    Number(hours || 0) * 60 +
    Number(minutes || 0)
  );
}

function hidratacao() {
  const total =
    getHydrationTotalToday();

  const goal =
    getHydrationDailyGoal();

  const pct = goal
    ? Math.min(
        100,
        Math.round(
          (total / goal) * 100
        )
      )
    : 0;

  const config =
    state.data.hidratacaoConfig;

  const records =
    state.data.hidratacao.filter(
      (x) =>
        String(
          x.createdAt || ""
        ).slice(0, 10) === todayISO()
    );

  return appShell(`
    ${pageHeader(
      "BEM-ESTAR",
      "Hidratação",
      "Defina sua rotina de água e acompanhe o consumo.",
      `
        <div class="page-header-actions">

          <button
            class="primary-button compact"
            data-action="add-hidratacao"
          >
            ${icon("plus")}
            Registrar
          </button>

          <button
            class="ghost-button compact"
            data-action="config-hidratacao"
          >
            ${icon("edit")}
            Meta
          </button>

        </div>
      `
    )}

    <div class="hydration-card">

      <div class="hydration-top">

        <div>

          <span class="eyebrow">
            HOJE
          </span>

          <h2>
            ${total} ml
          </h2>

          <p>
            de ${goal} ml de meta
          </p>

        </div>

        <div class="water-drop">
          ◉
        </div>

      </div>

      <div class="progress">

        <span
          style="width:${pct}%"
        ></span>

      </div>

      <div class="progress-labels">

        <span>
          0 ml
        </span>

        <strong>
          ${pct}%
        </strong>

        <span>
          ${goal} ml
        </span>

      </div>

      <div class="quick-water">

        ${[200, 300, 500]
          .map(
            (value) => `
              <button
                data-action="quick-water"
                data-value="${value}"
              >
                +${value} ml
              </button>
            `
          )
          .join("")}

      </div>

    </div>

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          Meta de hidratação
        </div>

        <button
          class="text-button"
          data-action="config-hidratacao"
        >
          Alterar
        </button>

      </div>

      <div class="hydration-settings-summary">

        <p>
          <strong>
            ${config.amountPerPeriod} ml
          </strong>
          a cada
          <strong>
            ${config.intervalMinutes} min
          </strong>
        </p>

        <p>
          Das
          <strong>
            ${esc(config.startTime)}
          </strong>
          às
          <strong>
            ${esc(config.endTime)}
          </strong>
        </p>

      </div>

    </div>

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          Registros de hoje
        </div>

        <button
          class="text-button"
          data-action="reset-hidratacao"
        >
          Limpar
        </button>

      </div>

      ${
        records.length
          ? `
            <div class="item-list">

              ${records
                .map(
                  (x) => `
                    <div class="list-item">

                      <div class="module-icon small">
                        ◉
                      </div>

                      <div class="item-main">

                        <strong>
                          ${x.amount} ml
                        </strong>

                        <span>
                          ${new Date(
                            x.createdAt
                          ).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit"
                            }
                          )}
                        </span>

                      </div>

                      <div class="item-actions">

                        <button
                          data-action="delete-hidratacao"
                          data-id="${x.id}"
                        >
                          ${icon("trash")}
                        </button>

                      </div>

                    </div>
                  `
                )
                .join("")}

            </div>
          `
          : `
            <p class="muted">
              Nenhum registro hoje.
            </p>
          `
      }

    </div>
  `);
}

/* =========================================================
   ALIMENTAÇÃO
   ========================================================= */

function getCaloriesConsumedToday() {
  return state.data.alimentacao
    .filter(
      (x) =>
        x.date === todayISO()
    )
    .reduce(
      (sum, x) =>
        sum + Number(x.calories || 0),
      0
    );
}

function getCaloriesRemainingToday() {
  const goal =
    Number(
      state.data.alimentacaoConfig
        .dailyCalories || 0
    );

  const consumed =
    getCaloriesConsumedToday();

  return Math.max(
    0,
    goal - consumed
  );
}

function alimentacao() {
  const goal =
    Number(
      state.data.alimentacaoConfig
        .dailyCalories || 0
    );

  const consumed =
    getCaloriesConsumedToday();

  const remaining =
    Math.max(
      0,
      goal - consumed
    );

  const percent = goal
    ? Math.min(
        100,
        Math.round(
          (consumed / goal) * 100
        )
      )
    : 0;

  const meals =
    state.data.alimentacao
      .filter(
        (x) =>
          x.date === todayISO()
      )
      .sort(
        (a, b) =>
          (a.time || "").localeCompare(
            b.time || ""
          )
      );

  return appShell(`
    ${pageHeader(
      "BEM-ESTAR",
      "Alimentação",
      "Registre suas refeições e acompanhe suas calorias.",
      `
        <div class="page-header-actions">

          <button
            class="primary-button compact"
            data-action="add-alimentacao"
          >
            ${icon("plus")}
            Refeição
          </button>

          <button
            class="ghost-button compact"
            data-action="config-alimentacao"
          >
            ${icon("edit")}
            Meta
          </button>

        </div>
      `
    )}

    <div class="stats-grid">

      ${statCard(
        `${consumed} kcal`,
        "Consumidas hoje",
        "pink"
      )}

      ${statCard(
        `${remaining} kcal`,
        "Restantes",
        "cyan"
      )}

      ${statCard(
        `${goal} kcal`,
        "Meta diária",
        "purple"
      )}

    </div>

    <div class="content-card">

      <div class="card-toolbar">

        <div>
          <div class="toolbar-title">
            Meta diária
          </div>

          <small class="muted">
            ${consumed} de ${goal} kcal
          </small>
        </div>

        <button
          class="text-button"
          data-action="config-alimentacao"
        >
          Alterar
        </button>

      </div>

      <div class="progress">

        <span
          style="width:${percent}%"
        ></span>

      </div>

      <div class="progress-labels">

        <span>
          0 kcal
        </span>

        <strong>
          ${percent}%
        </strong>

        <span>
          ${goal} kcal
        </span>

      </div>

    </div>

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          Refeições de hoje
        </div>

      </div>

      ${
        meals.length
          ? `
            <div class="item-list">

              ${meals
                .map(
                  (meal) => `
                    <div class="list-item">

                      <div class="module-icon small">
                        🍽️
                      </div>

                      <div class="item-main">

                        <strong>
                          ${esc(
                            meal.mealType
                          )}
                        </strong>

                        <span>

                          ${
                            meal.time
                              ? `${icon(
                                  "clock"
                                )} ${esc(
                                  meal.time
                                )}`
                              : ""
                          }

                          ${
                            meal.foods
                              ? ` · ${esc(
                                  meal.foods
                                )}`
                              : ""
                          }

                        </span>

                      </div>

                      <strong
                        class="finance-value expense"
                      >
                        ${meal.calories} kcal
                      </strong>

                      <div class="item-actions">

                        <button
                          data-action="edit-alimentacao"
                          data-id="${meal.id}"
                        >
                          ${icon("edit")}
                        </button>

                        <button
                          data-action="delete-alimentacao"
                          data-id="${meal.id}"
                        >
                          ${icon("trash")}
                        </button>

                      </div>

                    </div>
                  `
                )
                .join("")}

            </div>
          `
          : emptyState(
              "Nenhuma refeição registrada",
              "Adicione sua primeira refeição de hoje.",
              "Adicionar refeição",
              "add-alimentacao"
            )
      }

    </div>
  `);
}

function financas() {
  const income =
    state.data.financas
      .filter(
        (x) => x.type === "income"
      )
      .reduce(
        (s, x) =>
          s + Number(x.value || 0),
        0
      );

  const expense =
    state.data.financas
      .filter(
        (x) => x.type === "expense"
      )
      .reduce(
        (s, x) =>
          s + Number(x.value || 0),
        0
      );

  return listPage({
    key: "financas",

    title: "Finanças",

    subtitle:
      "Tenha uma visão simples do que entra e sai.",

    eyebrow: "DINHEIRO",

    stats: () => `
      ${statCard(
        money(income),
        "Entradas",
        "cyan"
      )}

      ${statCard(
        money(expense),
        "Saídas",
        "pink"
      )}

      ${statCard(
        money(income - expense),
        "Saldo",
        "purple"
      )}
    `,

    render: (x) => `
      <div class="list-item">

        <div class="finance-icon ${x.type}">
          ${
            x.type === "income"
              ? "↑"
              : "↓"
          }
        </div>

        <div class="item-main">

          <strong>
            ${esc(x.title)}
          </strong>

          <span>
            ${dateBR(
              x.date || todayISO()
            )}

            ·

            ${
              x.category
                ? esc(x.category)
                : "Geral"
            }
          </span>

        </div>

        <strong
          class="finance-value ${x.type}"
        >
          ${
            x.type === "income"
              ? "+"
              : "-"
          }

          ${money(x.value)}
        </strong>

        <div class="item-actions">

          <button
            data-action="edit-financa"
            data-id="${x.id}"
          >
            ${icon("edit")}
          </button>

          <button
            data-action="delete-financa"
            data-id="${x.id}"
          >
            ${icon("trash")}
          </button>

        </div>

      </div>
    `,

    filter: `
      <button
        class="filter-button"
        data-action="add-financa"
      >
        + Entrada / saída
      </button>
    `
  });
}

function objetivos() {
  return listPage({
    key: "objetivos",

    title: "Objetivos",

    subtitle:
      "Dê forma aos planos que você quer realizar.",

    eyebrow: "DIREÇÃO",

    render: (x) => `
      <div class="goal-item">

        <div class="goal-top">

          <div>

            <strong>
              ${esc(x.title)}
            </strong>

            <span>
              ${
                x.deadline
                  ? `Até ${dateBR(
                      x.deadline
                    )}`
                  : "Sem prazo"
              }
            </span>

          </div>

          <b>
            ${Number(
              x.progress || 0
            )}%
          </b>

        </div>

        <div class="progress">

          <span
            style="width:${Math.min(
              100,
              Number(x.progress || 0)
            )}%"
          ></span>

        </div>

        <div class="goal-actions">

          <button
            data-action="progress-objetivo"
            data-id="${x.id}"
          >
            Atualizar progresso
          </button>

          <button
            data-action="edit-objetivo"
            data-id="${x.id}"
          >
            Editar
          </button>

          <button
            data-action="delete-objetivo"
            data-id="${x.id}"
          >
            Excluir
          </button>

        </div>

      </div>
    `
  });
}

function familia() {
  return listPage({
    key: "familia",

    title: "Família",

    subtitle:
      "Uma visão compartilhada para organizar a vida juntos.",

    eyebrow: "COMPARTILHAMENTO",

    emptyTitle:
      "Ainda não há pessoas adicionadas",

    emptyText:
      "Cadastre pessoas para estruturar sua área familiar.",

    render: (x) => `
      <div class="list-item">

        <div class="avatar">
          ${esc(
            (x.name || "?")
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div class="item-main">

          <strong>
            ${esc(x.name)}
          </strong>

          <span>

            ${esc(
              x.relation || "Membro"
            )}

            ${
              x.email
                ? ` · ${esc(
                    x.email
                  )}`
                : ""
            }

          </span>

        </div>

        <div class="item-actions">

          <button
            data-action="edit-familia"
            data-id="${x.id}"
          >
            ${icon("edit")}
          </button>

          <button
            data-action="delete-familia"
            data-id="${x.id}"
          >
            ${icon("trash")}
          </button>

        </div>

      </div>
    `
  });
}

function assistente() {
  const pending =
    state.data.tarefas.filter(
      (x) => !x.done
    );

  const today =
    state.data.compromissos.filter(
      (x) =>
        x.date === todayISO()
    );

  return appShell(`
    ${pageHeader(
      "INTELIGÊNCIA",
      "Assistente LiDire",
      "Uma visão rápida da sua rotina para ajudar você a encontrar o próximo passo."
    )}

    <div class="assistant-screen">

      <div class="assistant-avatar">
        ✦
      </div>

      <h2>
        Como posso ajudar?
      </h2>

      <p>
        Experimente uma das sugestões abaixo.
      </p>

      <div class="suggestions">

        <button
          data-action="assistant-question"
          data-question="O que tenho para hoje?"
        >
          O que tenho para hoje?
        </button>

        <button
          data-action="assistant-question"
          data-question="Quais tarefas estão pendentes?"
        >
          Quais tarefas estão pendentes?
        </button>

        <button
          data-action="assistant-question"
          data-question="Como está minha rotina?"
        >
          Como está minha rotina?
        </button>

      </div>

      <div
        id="assistant-response"
        class="assistant-response"
      >

        <strong>
          Resumo atual
        </strong>

        <p>
          Você tem
          <b>${pending.length}</b>
          tarefa(s) pendente(s) e
          <b>${today.length}</b>
          compromisso(s) hoje.
        </p>

      </div>

    </div>
  `);
}

function explorar() {
  return appShell(`
    ${pageHeader(
      "LIDIRE",
      "Tudo em um só lugar",
      "Conheça os espaços que ajudam a transformar rotina em clareza."
    )}

    <div class="explore-grid">

      ${modules
        .map(moduleCard)
        .join("")}

      <button
        class="module-card featured"
        data-page="assistente"
      >

        <span class="module-icon">
          ✦
        </span>

        <span class="module-content">

          <strong>
            Assistente LiDire
          </strong>

          <small>
            Seu copiloto para organizar a rotina.
          </small>

        </span>

        <span class="module-arrow">
          ${icon("arrow")}
        </span>

      </button>

    </div>
  `);
}

function perfil() {
  const hasPhoto =
    Boolean(state.user.photo);

  return appShell(`
    ${pageHeader(
      "MINHA CONTA",
      "Perfil",
      "Personalize sua experiência na LiDire."
    )}

    <div class="profile-card">

      <div class="profile-avatar-large">

        ${
          hasPhoto
            ? `
              <img
                src="${esc(
                  state.user.photo
                )}"
                alt="Foto de perfil"
              >
            `
            : `
              ${esc(
                (
                  state.user.name ||
                  "A"
                )
                  .charAt(0)
                  .toUpperCase()
              )}
            `
        }

      </div>

      <h2>
        ${esc(
          state.user.name ||
            "Seu nome"
        )}
      </h2>

      <p>
        ${esc(
          state.user.email ||
            "Adicione seu e-mail"
        )}
      </p>

      <div class="profile-photo-actions">

        <button
          class="primary-button"
          data-action="add-profile-photo"
        >
          ${icon("camera")}
          ${
            hasPhoto
              ? "Alterar foto"
              : "Adicionar foto"
          }
        </button>

        ${
          hasPhoto
            ? `
              <button
                class="ghost-button"
                data-action="delete-profile-photo"
              >
                ${icon("trash")}
                Excluir foto
              </button>
            `
            : ""
        }

      </div>

      <button
        class="primary-button"
        data-action="edit-profile"
      >
        ${icon("edit")}
        Editar perfil
      </button>

    </div>

    <div class="settings-card">

      <button
        data-action="edit-profile"
      >

        <span>✎</span>

        <div>

          <strong>
            Dados pessoais
          </strong>

          <small>
            Nome, e-mail, idade e telefone
          </small>

        </div>

        ${icon("arrow")}

      </button>

      <button
        data-action="clear-local"
      >

        <span>↺</span>

        <div>

          <strong>
            Redefinir dados locais
          </strong>

          <small>
            Apaga os dados salvos neste dispositivo
          </small>

        </div>

        ${icon("arrow")}

      </button>

    </div>
  `);
}

const pages = {
  inicio: home,
  agenda,
  tarefas,
  compras,
  estudos,
  treinos,
  hidratacao,
  alimentacao,
  financas,
  objetivos,
  familia,
  assistente,
  explorar,
  perfil
};

function render() {
  const root =
    document.getElementById("app");

  if (!root) {
    console.error(
      "Elemento #app não encontrado."
    );
    return;
  }

  if (
    currentPage === "compras" &&
    currentShoppingList
  ) {
    root.innerHTML =
      listaCompras(
        currentShoppingList
      );
  } else {
    root.innerHTML =
      (
        pages[currentPage] ||
        home
      )();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
        }

function openModal(
  title,
  body,
  options = {}
) {
  closeModal();

  modal =
    document.createElement("div");

  modal.className =
    "modal-backdrop";

  modal.innerHTML = `
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
    >

      <div class="modal-header">

        <div>

          <span class="eyebrow">
            ${esc(
              options.eyebrow ||
                "LIDIRE"
            )}
          </span>

          <h2>
            ${esc(title)}
          </h2>

        </div>

        <button
          class="modal-close"
          data-action="close-modal"
        >
          ×
        </button>

      </div>

      <form
        id="lidire-form"
        class="form-grid"
      >

        ${body}

        <div class="modal-footer">

          <button
            type="button"
            class="ghost-button"
            data-action="close-modal"
          >
            Cancelar
          </button>

          <button
            class="primary-button"
            type="submit"
          >
            ${esc(
              options.submit ||
                "Salvar"
            )}
          </button>

        </div>

      </form>

    </div>
  `;

  document.body.appendChild(modal);

  modal
    .querySelector(
      "input, select, textarea"
    )
    ?.focus();
}

function closeModal() {
  document
    .querySelector(
      ".modal-backdrop"
    )
    ?.remove();

  modal = null;
}

/* =========================================================
   FORMULÁRIOS
   ========================================================= */

function addForm(key) {
  if (key === "compromissos") {
    openModal(
      "Novo compromisso",

      `
        ${field(
          "Título",
          "title",
          "text",
          "",
          "required"
        )}

        ${field(
          "Data",
          "date",
          "date",
          todayISO(),
          "required"
        )}

        ${field(
          "Horário",
          "time",
          "time",
          ""
        )}

        ${field(
          "Local",
          "location"
        )}
      `,

      {
        submit: "Adicionar"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      const f =
        new FormData(e.target);

      state.data.compromissos.push({
        id: uid("c"),
        title: f.get("title"),
        date: f.get("date"),
        time: f.get("time"),
        location: f.get("location")
      });

      saveState();
      closeModal();
      render();

      toast(
        "Compromisso adicionado."
      );
    };

    return;
  }

  if (key === "tarefas") {
    openModal(
      "Nova tarefa",

      `
        ${field(
          "Tarefa",
          "title",
          "text",
          "",
          "required"
        )}

        ${selectField(
          "Prioridade",
          "priority",
          [
            {
              value: "",
              label: "Normal"
            },
            {
              value: "Alta",
              label: "Alta"
            },
            {
              value: "Média",
              label: "Média"
            },
            {
              value: "Baixa",
              label: "Baixa"
            }
          ]
        )}

        ${field(
          "Prazo",
          "date",
          "date"
        )}
      `,

      {
        submit: "Adicionar"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      const f =
        new FormData(e.target);

      state.data.tarefas.push({
        id: uid("t"),
        title: f.get("title"),
        priority:
          f.get("priority"),
        date: f.get("date"),
        done: false
      });

      saveState();
      closeModal();
      render();

      toast(
        "Tarefa adicionada."
      );
    };

    return;
  }

  if (key === "compras") {
    adicionarListaCompras();
    return;
  }

  if (key === "estudos") {
    openModal(
      "Nova sessão de estudo",

      `
        ${field(
          "Matéria",
          "subject",
          "text",
          "",
          "required"
        )}

        ${field(
          "Tema",
          "topic"
        )}

        ${field(
          "Data",
          "date",
          "date",
          todayISO()
        )}

        ${field(
          "Horário",
          "time",
          "time"
        )}

        ${field(
          "Duração (min)",
          "duration",
          "number"
        )}
      `,

      {
        submit: "Registrar"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      const f =
        new FormData(e.target);

      state.data.estudos.push({
        id: uid("e"),
        subject:
          f.get("subject"),
        topic:
          f.get("topic"),
        date:
          f.get("date"),
        time:
          f.get("time"),
        duration:
          f.get("duration"),
        done: false
      });

      saveState();
      closeModal();
      render();

      toast(
        "Estudo registrado."
      );
    };

    return;
  }

  if (key === "treinos") {
    openModal(
      "Novo treino",

      `
        ${field(
          "Nome",
          "name",
          "text",
          "",
          "required"
        )}

        ${field(
          "Tipo",
          "type"
        )}

        ${field(
          "Data",
          "date",
          "date",
          todayISO()
        )}

        ${field(
          "Horário",
          "time",
          "time"
        )}

        ${field(
          "Duração (min)",
          "duration",
          "number"
        )}
      `,

      {
        submit: "Registrar"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      const f =
        new FormData(e.target);

      state.data.treinos.push({
        id: uid("tr"),
        name: f.get("name"),
        type: f.get("type"),
        date: f.get("date"),
        time: f.get("time"),
        duration:
          f.get("duration")
      });

      saveState();
      closeModal();
      render();

      toast(
        "Treino registrado."
      );
    };

    return;
  }

  if (key === "hidratacao") {
    openModal(
      "Registrar água",

      `
        ${field(
          "Quantidade (ml)",
          "amount",
          "number",
          "300",
          "required min='1'"
        )}
      `,

      {
        submit: "Registrar"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      const f =
        new FormData(e.target);

      state.data.hidratacao.push({
        id: uid("h"),
        amount:
          Number(
            f.get("amount")
          ),
        createdAt:
          new Date().toISOString()
      });

      saveState();
      closeModal();
      render();

      toast(
        "Hidratação registrada."
      );
    };

    return;
  }

  if (key === "alimentacao") {
    addMealForm();
    return;
  }

  if (key === "financas") {
    addFinanceForm();
    return;
  }

  if (key === "objetivos") {
    addGoalForm();
    return;
  }

  if (key === "familia") {
    addFamilyForm();
    return;
  }
}

/* =========================================================
   COMPRAS
   ========================================================= */

function adicionarListaCompras() {
  openModal(
    "Nova lista de compras",

    field(
      "Nome da lista",
      "name",
      "text",
      "",
      "required"
    ),

    {
      submit: "Criar lista"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    if (!state.data.compras) {
      state.data.compras = [];
    }

    state.data.compras.push({
      id: uid("lista"),
      name: f.get("name"),
      items: []
    });

    saveState();
    closeModal();
    render();

    toast(
      "Lista criada."
    );
  };
}

function addItemCompra(listId) {
  const lista =
    state.data.compras.find(
      (x) => x.id === listId
    );

  if (!lista) return;

  openModal(
    "Adicionar item",

    `
      ${field(
        "Item",
        "name",
        "text",
        "",
        "required"
      )}

      ${field(
        "Quantidade",
        "quantity"
      )}

      ${field(
        "Categoria",
        "category"
      )}
    `,

    {
      submit: "Adicionar"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    lista.items =
      lista.items || [];

    lista.items.push({
      id: uid("item"),
      name: f.get("name"),
      quantity:
        f.get("quantity"),
      category:
        f.get("category"),
      done: false
    });

    saveState();
    closeModal();
    render();

    toast(
      "Item adicionado."
    );
  };
}

/* =========================================================
   ALIMENTAÇÃO
   ========================================================= */

function addMealForm(item = null) {
  const editing =
    Boolean(item);

  openModal(
    editing
      ? "Editar refeição"
      : "Nova refeição",

    `
      ${selectField(
        "Refeição",
        "mealType",
        [
          {
            value: "Café da manhã",
            label: "Café da manhã"
          },
          {
            value: "Lanche da manhã",
            label: "Lanche da manhã"
          },
          {
            value: "Almoço",
            label: "Almoço"
          },
          {
            value: "Lanche da tarde",
            label: "Lanche da tarde"
          },
          {
            value: "Jantar",
            label: "Jantar"
          },
          {
            value: "Ceia",
            label: "Ceia"
          },
          {
            value: "Outra",
            label: "Outra"
          }
        ],
        item?.mealType ||
          "Café da manhã"
      )}

      ${field(
        "Data",
        "date",
        "date",
        item?.date ||
          todayISO(),
        "required"
      )}

      ${field(
        "Horário",
        "time",
        "time",
        item?.time || "",
        "required"
      )}

      <label class="form-field">

        <span>
          Alimentos
        </span>

        <textarea
          name="foods"
          rows="4"
          placeholder="Ex.: arroz, feijão, frango, salada"
          required
        >${esc(
          item?.foods || ""
        )}</textarea>

      </label>

      ${field(
        "Calorias (kcal)",
        "calories",
        "number",
        item?.calories || "",
        "min='0' step='1' required"
      )}
    `,

    {
      submit: editing
        ? "Salvar"
        : "Adicionar"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    const data = {
      mealType:
        f.get("mealType"),
      date:
        f.get("date"),
      time:
        f.get("time"),
      foods:
        f.get("foods"),
      calories:
        Number(
          f.get("calories") || 0
        )
    };

    if (editing) {
      Object.assign(
        item,
        data
      );

      toast(
        "Refeição atualizada."
      );
    } else {
      state.data.alimentacao.push({
        id: uid("meal"),
        ...data
      });

      toast(
        "Refeição adicionada."
      );
    }

    saveState();
    closeModal();
    render();
  };
}

function configurarAlimentacao() {
  const current =
    state.data.alimentacaoConfig
      .dailyCalories;

  openModal(
    "Meta diária de calorias",

    `
      ${field(
        "Meta diária (kcal)",
        "dailyCalories",
        "number",
        current,
        "min='1' required"
      )}

      <p class="muted">
        A LiDire descontará automaticamente
        as calorias das refeições registradas
        no dia.
      </p>
    `,

    {
      submit: "Salvar meta"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    state.data.alimentacaoConfig
      .dailyCalories =
      Number(
        f.get("dailyCalories")
      );

    saveState();
    closeModal();
    render();

    toast(
      "Meta de calorias atualizada."
    );
  };
}

/* =========================================================
   HIDRATAÇÃO — CONFIGURAÇÃO
   ========================================================= */

function configurarHidratacao() {
  const config =
    state.data.hidratacaoConfig;

  openModal(
    "Configurar hidratação",

    `
      ${field(
        "Quantidade por período (ml)",
        "amountPerPeriod",
        "number",
        config.amountPerPeriod,
        "min='1' required"
      )}

      ${field(
        "Intervalo entre períodos (minutos)",
        "intervalMinutes",
        "number",
        config.intervalMinutes,
        "min='1' required"
      )}

      ${field(
        "Horário inicial",
        "startTime",
        "time",
        config.startTime,
        "required"
      )}

      ${field(
        "Horário final",
        "endTime",
        "time",
        config.endTime,
        "required"
      )}

      <p class="muted">
        Exemplo: 300 ml a cada 120 minutos,
        das 08:00 às 20:00.
      </p>
    `,

    {
      submit: "Salvar configuração"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    state.data.hidratacaoConfig = {
      amountPerPeriod:
        Number(
          f.get(
            "amountPerPeriod"
          )
        ),

      intervalMinutes:
        Number(
          f.get(
            "intervalMinutes"
          )
        ),

      startTime:
        f.get("startTime"),

      endTime:
        f.get("endTime")
    };

    saveState();
    closeModal();
    render();

    toast(
      "Meta de hidratação atualizada."
    );
  };
}

/* =========================================================
   FINANÇAS
   ========================================================= */

function addFinanceForm(item = null) {
  const editing =
    Boolean(item);

  openModal(
    editing
      ? "Editar lançamento"
      : "Novo lançamento",

    `
      ${selectField(
        "Tipo",
        "type",
        [
          {
            value: "expense",
            label: "Saída"
          },
          {
            value: "income",
            label: "Entrada"
          }
        ],
        item?.type ||
          "expense"
      )}

      ${field(
        "Descrição",
        "title",
        "text",
        item?.title || "",
        "required"
      )}

      ${field(
        "Valor",
        "value",
        "number",
        item?.value || "",
        "step='0.01' min='0' required"
      )}

      ${field(
        "Categoria",
        "category",
        "text",
        item?.category || ""
      )}

      ${field(
        "Data",
        "date",
        "date",
        item?.date ||
          todayISO()
      )}
    `,

    {
      submit: editing
        ? "Salvar"
        : "Salvar"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    const data = {
      type:
        f.get("type"),
      title:
        f.get("title"),
      value:
        Number(
          f.get("value") || 0
        ),
      category:
        f.get("category"),
      date:
        f.get("date")
    };

    if (editing) {
      Object.assign(
        item,
        data
      );

      toast(
        "Lançamento atualizado."
      );
    } else {
      state.data.financas.push({
        id: uid("f"),
        ...data
      });

      toast(
        "Lançamento salvo."
      );
    }

    saveState();
    closeModal();
    render();
  };
}

/* =========================================================
   OBJETIVOS
   ========================================================= */

function addGoalForm(item = null) {
  const editing =
    Boolean(item);

  openModal(
    editing
      ? "Editar objetivo"
      : "Novo objetivo",

    `
      ${field(
        "Objetivo",
        "title",
        "text",
        item?.title || "",
        "required"
      )}

      ${field(
        "Prazo",
        "deadline",
        "date",
        item?.deadline || ""
      )}

      ${field(
        "Progresso (%)",
        "progress",
        "number",
        item?.progress ?? 0,
        "min='0' max='100'"
      )}
    `,

    {
      submit: editing
        ? "Salvar"
        : "Criar objetivo"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    const data = {
      title:
        f.get("title"),
      deadline:
        f.get("deadline"),
      progress:
        Number(
          f.get("progress") || 0
        )
    };

    if (editing) {
      Object.assign(
        item,
        data
      );

      toast(
        "Objetivo atualizado."
      );
    } else {
      state.data.objetivos.push({
        id: uid("o"),
        ...data
      });

      toast(
        "Objetivo criado."
      );
    }

    saveState();
    closeModal();
    render();
  };
}

/* =========================================================
   FAMÍLIA
   ========================================================= */

function addFamilyForm(item = null) {
  const editing =
    Boolean(item);

  openModal(
    editing
      ? "Editar pessoa"
      : "Adicionar pessoa",

    `
      ${field(
        "Nome",
        "name",
        "text",
        item?.name || "",
        "required"
      )}

      ${field(
        "Relação",
        "relation",
        "text",
        item?.relation || ""
      )}

      ${field(
        "E-mail",
        "email",
        "email",
        item?.email || ""
      )}
    `,

    {
      submit: editing
        ? "Salvar"
        : "Adicionar"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    const data = {
      name:
        f.get("name"),
      relation:
        f.get("relation"),
      email:
        f.get("email")
    };

    if (editing) {
      Object.assign(
        item,
        data
      );

      toast(
        "Pessoa atualizada."
      );
    } else {
      state.data.familia.push({
        id: uid("m"),
        ...data
      });

      toast(
        "Pessoa adicionada."
      );
    }

    saveState();
    closeModal();
    render();
  };
}

/* =========================================================
   PERFIL — FOTO
   ========================================================= */

function addProfilePhoto() {
  openModal(
    state.user.photo
      ? "Alterar foto de perfil"
      : "Adicionar foto de perfil",

    `
      <label class="form-field">

        <span>
          Foto de perfil
        </span>

        <input
          id="profile-photo-input"
          name="photo"
          type="file"
          accept="image/*"
          required
        >

      </label>

      <div
        id="profile-photo-preview"
        class="profile-photo-preview"
      ></div>
    `,

    {
      submit: state.user.photo
        ? "Alterar foto"
        : "Adicionar foto"
    }
  );

  const input =
    modal.querySelector(
      "#profile-photo-input"
    );

  const preview =
    modal.querySelector(
      "#profile-photo-preview"
    );

  input.addEventListener(
    "change",
    () => {
      const file =
        input.files?.[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = () => {
        preview.innerHTML = `
          <img
            src="${reader.result}"
            alt="Prévia da foto"
          >
        `;
      };

      reader.readAsDataURL(file);
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const file =
      input.files?.[0];

    if (!file) {
      toast(
        "Selecione uma foto.",
        "error"
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      state.user.photo =
        reader.result;

      saveState();
      closeModal();
      render();

      toast(
        "Foto de perfil atualizada."
      );
    };

    reader.readAsDataURL(file);
  };
}

function deleteProfilePhoto() {
  if (
    !state.user.photo
  ) {
    toast(
      "Não há foto de perfil.",
      "error"
    );

    return;
  }

  if (
    confirm(
      "Excluir sua foto de perfil?"
    )
  ) {
    state.user.photo = "";

    saveState();
    render();

    toast(
      "Foto de perfil excluída."
    );
  }
}

/* =========================================================
   EDIÇÃO
   ========================================================= */

function editItem(
  type,
  id
) {
  const map = {
    compromisso:
      "compromissos",
    tarefa:
      "tarefas"
  };

  const key =
    map[type];

  const item =
    state.data[key]?.find(
      (x) => x.id === id
    );

  if (!item) return;

  if (
    type === "compromisso"
  ) {
    openModal(
      "Editar compromisso",

      `
        ${field(
          "Título",
          "title",
          "text",
          item.title,
          "required"
        )}

        ${field(
          "Data",
          "date",
          "date",
          item.date,
          "required"
        )}

        ${field(
          "Horário",
          "time",
          "time",
          item.time || ""
        )}

        ${field(
          "Local",
          "location",
          "text",
          item.location || ""
        )}
      `,

      {
        submit: "Salvar"
      }
    );
  }

  if (
    type === "tarefa"
  ) {
    openModal(
      "Editar tarefa",

      `
        ${field(
          "Tarefa",
          "title",
          "text",
          item.title,
          "required"
        )}

        ${selectField(
          "Prioridade",
          "priority",
          [
            {
              value: "",
              label: "Normal"
            },
            {
              value: "Alta",
              label: "Alta"
            },
            {
              value: "Média",
              label: "Média"
            },
            {
              value: "Baixa",
              label: "Baixa"
            }
          ],
          item.priority || ""
        )}

        ${field(
          "Prazo",
          "date",
          "date",
          item.date || ""
        )}
      `,

      {
        submit: "Salvar"
      }
    );
  }

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    Object.assign(
      item,
      Object.fromEntries(
        f.entries()
      )
    );

    saveState();
    closeModal();
    render();

    toast(
      "Alterações salvas."
    );
  };
}

/* =========================================================
   REMOÇÃO
   ========================================================= */

function removeItem(
  key,
  id,
  message = "Item removido."
) {
  if (!state.data[key]) {
    return;
  }

  state.data[key] =
    state.data[key].filter(
      (x) => x.id !== id
    );

  saveState();
  render();

  toast(message);
}

/* =========================================================
   AÇÕES
   ========================================================= */

function handleAction(
  action,
  el
) {
  if (
    action === "quick-add"
  ) {
    openModal(
      "O que você quer adicionar?",

      `
        <div class="quick-actions">

          ${[
            [
              "compromissos",
              "▣",
              "Compromisso"
            ],
            [
              "tarefas",
              "✓",
              "Tarefa"
            ],
            [
              "compras",
              "🛒",
              "Compra"
            ],
            [
              "estudos",
              "▤",
              "Estudo"
            ],
            [
              "treinos",
              "♢",
              "Treino"
            ],
            [
              "hidratacao",
              "◉",
              "Água"
            ],
            [
              "alimentacao",
              "🍽️",
              "Refeição"
            ],
            [
              "financas",
              "R$",
              "Finança"
            ],
            [
              "objetivos",
              "◎",
              "Objetivo"
            ],
            [
              "familia",
              "♧",
              "Pessoa"
            ]
          ]
            .map(
              (x) => `
                <button
                  type="button"
                  class="quick-option"
                  data-action="quick-option"
                  data-key="${x[0]}"
                >
                  <span>${x[1]}</span>
                  ${x[2]}
                </button>
              `
            )
            .join("")}

        </div>
      `,

      {
        submit: "Fechar"
      }
    );

    modal.querySelector(
      ".modal-footer"
    ).style.display =
      "none";

    return;
  }

  if (
    action === "quick-option"
  ) {
    const key =
      el.dataset.key;

    closeModal();
    addForm(key);

    return;
  }

  if (
    action === "close-modal"
  ) {
    closeModal();
    return;
  }

  if (
    action.startsWith("add-")
  ) {
    addForm(
      action.slice(4)
    );

    return;
  }

  const id =
    el.dataset.id;

  if (
    action === "toggle-tarefa"
  ) {
    const item =
      state.data.tarefas.find(
        (x) => x.id === id
      );

    if (item) {
      item.done =
        !item.done;
    }

    saveState();
    render();

    return;
  }

  if (
    action ===
    "toggle-estudo"
  ) {
    const item =
      state.data.estudos.find(
        (x) => x.id === id
      );

    if (item) {
      item.done =
        !item.done;
    }

    saveState();
    render();

    return;
  }

  if (
    action ===
    "toggle-item-compra"
  ) {
    const lista =
      state.data.compras.find(
        (x) =>
          x.id ===
          el.dataset.listId
      );

    const item =
      lista?.items?.find(
        (x) =>
          x.id === id
      );

    if (item) {
      item.done =
        !item.done;
    }

    saveState();
    render();

    return;
  }

  if (
    action ===
    "open-lista-compras"
  ) {
    currentShoppingList =
      id;

    currentPage =
      "compras";

    render();

    return;
  }

  if (
    action ===
    "back-compras"
  ) {
    currentShoppingList =
      null;

    currentPage =
      "compras";

    render();

    return;
  }

  if (
    action ===
    "add-item-compra"
  ) {
    addItemCompra(id);
    return;
  }

  if (
    action ===
    "edit-item-compra"
  ) {
    editItemCompra(
      el.dataset.listId,
      id
    );

    return;
  }

  if (
    action ===
    "delete-item-compra"
  ) {
    const lista =
      state.data.compras.find(
        (x) =>
          x.id ===
          el.dataset.listId
      );

    if (!lista) return;

    lista.items =
      (lista.items || [])
        .filter(
          (x) => x.id !== id
        );

    saveState();
    render();

    toast(
      "Item removido."
    );

    return;
  }

  if (
    action ===
    "delete-lista-compras"
  ) {
    if (
      confirm(
        "Excluir esta lista de compras?"
      )
    ) {
      state.data.compras =
        state.data.compras.filter(
          (x) => x.id !== id
        );

      currentShoppingList =
        null;

      saveState();
      render();

      toast(
        "Lista excluída."
      );
    }

    return;
  }

  if (
    action ===
    "edit-compromisso"
  ) {
    editItem(
      "compromisso",
      id
    );

    return;
  }

  if (
    action ===
    "edit-tarefa"
  ) {
    editItem(
      "tarefa",
      id
    );

    return;
  }

  if (
    action ===
    "add-profile-photo"
  ) {
    addProfilePhoto();
    return;
  }

  if (
    action ===
    "delete-profile-photo"
  ) {
    deleteProfilePhoto();
    return;
  }

  if (
    action ===
    "config-alimentacao"
  ) {
    configurarAlimentacao();
    return;
  }

  if (
    action ===
    "edit-alimentacao"
  ) {
    const item =
      state.data.alimentacao.find(
        (x) => x.id === id
      );

    if (item) {
      addMealForm(item);
    }

    return;
  }

  if (
    action ===
    "delete-alimentacao"
  ) {
    removeItem(
      "alimentacao",
      id,
      "Refeição removida."
    );

    return;
  }

  if (
    action ===
    "config-hidratacao"
  ) {
    configurarHidratacao();
    return;
  }

  if (
    action ===
    "quick-water"
  ) {
    state.data.hidratacao.push({
      id: uid("h"),
      amount:
        Number(
          el.dataset.value
        ),
      createdAt:
        new Date().toISOString()
    });

    saveState();
    render();

    toast(
      `+${el.dataset.value} ml registrados.`
    );

    return;
  }

  if (
    action ===
    "reset-hidratacao"
  ) {
    if (
      confirm(
        "Limpar todos os registros de hidratação?"
      )
    ) {
      state.data.hidratacao =
        state.data.hidratacao.filter(
          (x) =>
            String(
              x.createdAt || ""
            ).slice(0, 10) !==
            todayISO()
        );

      saveState();
      render();

      toast(
        "Registros de hoje limpos."
      );
    }

    return;
  }

  if (
    action ===
    "edit-estudo"
  ) {
    const item =
      state.data.estudos.find(
        (x) => x.id === id
      );

    if (!item) return;

    openModal(
      "Editar sessão de estudo",

      `
        ${field(
          "Matéria",
          "subject",
          "text",
          item.subject,
          "required"
        )}

        ${field(
          "Tema",
          "topic",
          "text",
          item.topic || ""
        )}

        ${field(
          "Data",
          "date",
          "date",
          item.date || ""
        )}

        ${field(
          "Horário",
          "time",
          "time",
          item.time || ""
        )}

        ${field(
          "Duração (min)",
          "duration",
          "number",
          item.duration || ""
        )}
      `,

      {
        submit: "Salvar"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      const f =
        new FormData(e.target);

      Object.assign(
        item,
        Object.fromEntries(
          f.entries()
        )
      );

      saveState();
      closeModal();
      render();

      toast(
        "Estudo atualizado."
      );
    };

    return;
  }

  if (
    action ===
    "edit-treino"
  ) {
    const item =
      state.data.treinos.find(
        (x) => x.id === id
      );

    if (!item) return;

    openModal(
      "Editar treino",

      `
        ${field(
          "Nome",
          "name",
          "text",
          item.name,
          "required"
        )}

        ${field(
          "Tipo",
          "type",
          "text",
          item.type || ""
        )}

        ${field(
          "Data",
          "date",
          "date",
          item.date || ""
        )}

        ${field(
          "Horário",
          "time",
          "time",
          item.time || ""
        )}

        ${field(
          "Duração (min)",
          "duration",
          "number",
          item.duration || ""
        )}
      `,

      {
        submit: "Salvar"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      const f =
        new FormData(e.target);

      Object.assign(
        item,
        Object.fromEntries(
          f.entries()
        )
      );

      saveState();
      closeModal();
      render();

      toast(
        "Treino atualizado."
      );
    };

    return;
  }

  if (
    action ===
    "edit-financa"
  ) {
    const item =
      state.data.financas.find(
        (x) => x.id === id
      );

    if (item) {
      addFinanceForm(item);
    }

    return;
  }

  if (
    action ===
    "edit-objetivo"
  ) {
    const item =
      state.data.objetivos.find(
        (x) => x.id === id
      );

    if (item) {
      addGoalForm(item);
    }

    return;
  }

  if (
    action ===
    "edit-familia"
  ) {
    const item =
      state.data.familia.find(
        (x) => x.id === id
      );

    if (item) {
      addFamilyForm(item);
    }

    return;
  }

  if (
    action ===
    "progress-objetivo"
  ) {
    const item =
      state.data.objetivos.find(
        (x) => x.id === id
      );

    if (!item) return;

    openModal(
      "Atualizar progresso",

      field(
        "Progresso (%)",
        "progress",
        "number",
        item.progress,
        "min='0' max='100' required"
      ),

      {
        submit: "Atualizar"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      item.progress =
        Number(
          new FormData(
            e.target
          ).get("progress")
        );

      saveState();
      closeModal();
      render();

      toast(
        "Progresso atualizado."
      );
    };

    return;
  }

  if (
    action ===
    "assistant-question"
  ) {
    const q =
      el.dataset.question;

    let response = "";

    if (
      q.includes("hoje")
    ) {
      response =
        `Hoje você tem ${
          state.data.compromissos.filter(
            (x) =>
              x.date ===
              todayISO()
          ).length
        } compromisso(s) na agenda e ${
          state.data.tarefas.filter(
            (x) => !x.done
          ).length
        } tarefa(s) pendente(s).`;
    } else if (
      q.includes("pendentes")
    ) {
      response =
        `Você tem ${
          state.data.tarefas
            .filter(
              (x) => !x.done
            )
            .map(
              (x) => x.title
            )
            .join(", ") ||
          "nenhuma tarefa pendente"
        }.`;
    } else {
      response =
        `Sua rotina tem ${
          state.data.tarefas.filter(
            (x) => !x.done
          ).length
        } tarefa(s) pendente(s), ${
          state.data.objetivos
            .length
        } objetivo(s) e ${
          state.data.compras.reduce(
            (total, lista) =>
              total +
              (lista.items || [])
                .filter(
                  (x) => !x.done
                ).length,
            0
          )
        } item(ns) pendente(s) nas compras.`;
    }

    const box =
      document.getElementById(
        "assistant-response"
      );

    if (box) {
      box.innerHTML = `
        <strong>
          LiDire
        </strong>

        <p>
          ${esc(response)}
        </p>
      `;
    }

    return;
  }

  if (
    action ===
    "edit-profile"
  ) {
    openModal(
      "Editar perfil",

      `
        ${field(
          "Nome",
          "name",
          "text",
          state.user.name,
          "required"
        )}

        ${field(
          "E-mail",
          "email",
          "email",
          state.user.email || ""
        )}

        ${field(
          "Idade",
          "age",
          "number",
          state.user.age || ""
        )}

        ${field(
          "Telefone",
          "phone",
          "tel",
          state.user.phone || ""
        )}
      `,

      {
        submit: "Salvar perfil"
      }
    );

    modal.querySelector(
      "#lidire-form"
    ).onsubmit = (e) => {
      e.preventDefault();

      const f =
        new FormData(e.target);

      state.user = {
        ...state.user,
        ...Object.fromEntries(
          f.entries()
        )
      };

      saveState();
      closeModal();
      render();

      toast(
        "Perfil atualizado."
      );
    };

    return;
  }

  if (
    action ===
    "clear-local"
  ) {
    if (
      confirm(
        "Isso apagará os dados salvos neste dispositivo. Continuar?"
      )
    ) {
      state =
        cloneDefaultState();

      saveState();
      render();

      toast(
        "Dados locais redefinidos."
      );
    }

    return;
  }

  const deletes = {
    "delete-compromisso": [
      "compromissos",
      "Compromisso removido."
    ],

    "delete-tarefa": [
      "tarefas",
      "Tarefa removida."
    ],

    "delete-estudo": [
      "estudos",
      "Registro removido."
    ],

    "delete-treino": [
      "treinos",
      "Treino removido."
    ],

    "delete-hidratacao": [
      "hidratacao",
      "Registro removido."
    ],

    "delete-financa": [
      "financas",
      "Lançamento removido."
    ],

    "delete-objetivo": [
      "objetivos",
      "Objetivo removido."
    ],

    "delete-familia": [
      "familia",
      "Pessoa removida."
    ]
  };

  if (deletes[action]) {
    removeItem(
      ...deletes[action],
      id
    );

    return;
  }
}

/* =========================================================
   EDIÇÃO DE ITEM DE COMPRAS
   ========================================================= */

function editItemCompra(
  listId,
  itemId
) {
  const lista =
    state.data.compras.find(
      (x) => x.id === listId
    );

  const item =
    lista?.items?.find(
      (x) => x.id === itemId
    );

  if (!lista || !item) {
    return;
  }

  openModal(
    "Editar item",

    `
      ${field(
        "Item",
        "name",
        "text",
        item.name,
        "required"
      )}

      ${field(
        "Quantidade",
        "quantity",
        "text",
        item.quantity || ""
      )}

      ${field(
        "Categoria",
        "category",
        "text",
        item.category || ""
      )}
    `,

    {
      submit: "Salvar"
    }
  );

  modal.querySelector(
    "#lidire-form"
  ).onsubmit = (e) => {
    e.preventDefault();

    const f =
      new FormData(e.target);

    Object.assign(
      item,
      Object.fromEntries(
        f.entries()
      )
    );

    saveState();
    closeModal();
    render();

    toast(
      "Item atualizado."
    );
  };
}

/* =========================================================
   EVENTOS
   ========================================================= */

document.addEventListener(
  "click",
  (event) => {
    const pageEl =
      event.target.closest(
        "[data-page]"
      );

    if (pageEl) {
      event.preventDefault();

      currentPage =
        pageEl.dataset.page;

      currentShoppingList =
        null;

      render();

      return;
    }

    const actionEl =
      event.target.closest(
        "[data-action]"
      );

    if (actionEl) {
      event.preventDefault();

      handleAction(
        actionEl.dataset.action,
        actionEl
      );
    }
  }
);

document.addEventListener(
  "click",
  (event) => {
    if (
      event.target.classList.contains(
        "modal-backdrop"
      )
    ) {
      closeModal();
    }
  }
);

/* =========================================================
   API PÚBLICA DO LIDIRE
   ========================================================= */

window.LiDire = {
  state: () => state,

  save: saveState,

  go: (page) => {
    currentPage = page;
    currentShoppingList = null;
    render();
  },

  reset: () => {
    state =
      cloneDefaultState();

    saveState();
    render();
  }
};

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    render();
  }
);

if (
  document.readyState !==
  "loading"
) {
  render();
        }
