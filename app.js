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
