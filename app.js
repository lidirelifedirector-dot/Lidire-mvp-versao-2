const STORAGE_KEY = "lidire-mvp-data";

const defaultState = {
  user: {
    name: "Alice",
    email: "conta@lidire.com",
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
    alimentação: [],
    finanças: [],
    objetivos: [],
    família: []
  }
};

let state = loadState();
let currentPage = "início";
let currentShoppingList = null;
let modal = null;


/* =========================================================
   ESTADO E ARMAZENAMENTO
   ========================================================= */

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      return structuredClone(defaultState);
    }

    return {
      ...structuredClone(defaultState),

      ...saved,

      user: {
        ...defaultState.user,
        ...(saved.user || {})
      },

      data: {
        ...defaultState.data,
        ...(saved.data || {})
      }
    };

  } catch {
    return structuredClone(defaultState);
  }
}


function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

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
  return Number(value || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}


function dateBR(value) {
  if (!value) return "";

  const [y, m, d] = value.split("-");

  return y && m && d
    ? `${d}/${m}/${y}`
    : value;
}


function todayISO() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


function toast(message, type = "success") {

  document
    .querySelectorAll(".lidire-toast")
    .forEach(el => el.remove());

  const el = document.createElement("div");

  el.className =
    `lidire-toast ${type}`;

  el.innerHTML = `
    <span>
      ${type === "success" ? "✓" : "!"}
    </span>
    ${esc(message)}
  `;

  document.body.appendChild(el);

  setTimeout(
    () => el.remove(),
    2600
  );
}


/* =========================================================
   ÍCONES
   ========================================================= */

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


/* =========================================================
   MÓDULOS
   ========================================================= */

const modules = [

  [
    "agenda",
    "Agenda",
    "Compromissos e horários",
    "calendar",
    "agenda"
  ],

  [
    "tarefas",
    "Tarefas",
    "Tudo o que precisa ser feito",
    "check",
    "tarefas"
  ],

  [
    "compras",
    "Compras",
    "Listas para não esquecer",
    "cart",
    "compras"
  ],

  [
    "estudos",
    "Estudos",
    "Organize seu aprendizado",
    "book",
    "estudos"
  ],

  [
    "treinos",
    "Treinos",
    "Movimente-se e acompanhe",
    "dumbbell",
    "treinos"
  ],

  [
    "hidratacao",
    "Hidratação",
    "Cuide da sua rotina",
    "drop",
    "hidratacao"
  ],

  [
    "financas",
    "Finanças",
    "Entradas e gastos",
    "wallet",
    "finanças"
  ],

  [
    "objetivos",
    "Objetivos",
    "Transforme planos em passos",
    "target",
    "objetivos"
  ],

  [
    "familia",
    "Família",
    "Compartilhe sua rotina",
    "family",
    "família"
  ]

];


/* =========================================================
   ESTRUTURA PRINCIPAL
   ========================================================= */

function appShell(
  content,
  title = "LiDire - Seu Copiloto para a Vida"
) {

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
            ${esc(
              (state.user.name || "A")
                .charAt(0)
                .toUpperCase()
            )}
          </button>

        </div>

      </header>


      <main class="main-content">

        ${content}

      </main>


      <nav class="bottom-nav">

        ${nav.map(
          ([id, ico, label]) => `

            <button
              class="nav-item ${
                currentPage === id
                  ? "active"
                  : ""
              }"
              data-page="${id}"
            >

              <span>${ico}</span>

              <small>${label}</small>

            </button>

          `
        ).join("")}

      </nav>

    </div>

  `;
}


/* =========================================================
   CABEÇALHO
   ========================================================= */

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


function statCard(
  value,
  label,
  tone = ""
) {

  return `

    <div class="stat-card ${tone}">

      <strong>
        ${esc(value)}
      </strong>

      <span>
        ${esc(label)}
      </span>

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
        data-action="${action}"
      >
        ${icon("plus")}
        ${esc(actionLabel)}
      </button>

    </div>

  `;
}


/* =========================================================
   HOME
   ========================================================= */

function home() {

  const pending =
    state.data.tarefas
      .filter(x => !x.done)
      .length;

  const commitments =
    state.data.compromissos
      .filter(x => x.date === todayISO())
      .length;

  const goals =
    state.data.objetivos.length;

  const firstName =
    (state.user.name || "você")
      .split(" ")[0];


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

          <span>
            Vamos organizar seu dia?
          </span>

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
          Ver tudo
          ${icon("arrow")}
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
          Precisa de ajuda para decidir o próximo passo?
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
        Conversar
        ${icon("arrow")}
      </button>

    </section>

  `);
}


/* =========================================================
   CARDS DE MÓDULOS
   ========================================================= */

function moduleCard([
  id,
  title,
  desc,
  ico,
  page
]) {

  const count =
    countFor(id);

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

    return state.data.tarefas
      .filter(x => !x.done)
      .length;

  }


  if (id === "agenda") {

    return state.data.compromissos.length;

  }


  if (id === "compras") {

    return state.data.compras.reduce(
      (total, lista) =>
        total +
        (lista.items || [])
          .filter(item => !item.done)
          .length,
      0
    );

  }


  return state.data[id]?.length || 0;
}


/* =========================================================
   PÁGINAS GENÉRICAS
   ========================================================= */

function listPage(config) {

  const items =
    state.data[config.key] || [];

  const visible = items;


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

          ${visible.length}

          ${
            visible.length === 1
              ? "item"
              : "itens"
          }

        </div>


        <div class="toolbar-filter">

          ${config.filter || ""}

        </div>

      </div>


      ${
        visible.length

          ? `

            <div class="item-list">

              ${visible
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


/* =========================================================
   AGENDA
   ========================================================= */

function agenda() {

  const items =
    [...state.data.compromissos]
      .sort(
        (a, b) =>
          `${a.date} ${a.time}`
            .localeCompare(
              `${b.date} ${b.time}`
            )
      );


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

    render: x => `

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
                ? `◷ ${esc(x.time)}`
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


/* =========================================================
   TAREFAS
   ========================================================= */

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
        state.data.tarefas
          .filter(x => x.done)
          .length;

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
            ? Math.round(done / all * 100) + "%"
            : "0%",
          "Progresso",
          "pink"
        )}

      `;

    },

    emptyTitle:
      "Nenhuma tarefa criada",

    render: x => `

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
                ? `Prioridade: ${esc(x.priority)}`
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
/* =========================================================
   COMPRAS — LISTAS
   ========================================================= */

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

          ? listas.map(lista => {

              const total =
                lista.items?.length || 0;

              const done =
                lista.items
                  ?.filter(item => item.done)
                  .length || 0;


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

            }).join("")


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


/* =========================================================
   LISTA DE COMPRAS INDIVIDUAL
   ========================================================= */

function listaCompras(id) {

  const lista =
    state.data.compras.find(
      x => x.id === id
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
    items.filter(x => x.done).length;


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

      `
        ${items.length}
        ${
          items.length === 1
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
      `,

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

              ${items.map(item => `

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
                          ? esc(item.quantity)
                          : ""
                      }

                      ${
                        item.category
                          ? ` · ${esc(item.category)}`
                          : ""
                      }

                    </span>

                  </div>


                  <div class="item-actions">

                    <button
                      data-action="delete-item-compra"
                      data-list-id="${lista.id}"
                      data-id="${item.id}"
                    >
                      ${icon("trash")}
                    </button>

                  </div>


                </div>

              `).join("")}

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


/* =========================================================
   ESTUDOS
   ========================================================= */

function estudos() {

  return listPage({

    key: "estudos",

    title: "Estudos",

    subtitle:
      "Acompanhe matérias, sessões e seu progresso.",

    eyebrow: "APRENDIZADO",

    render: x => `

      <div class="list-item ${
        x.done
          ? "completed"
          : ""
      }">


        <button
          class="check-button ${
            x.done
              ? "checked"
              : ""
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
                ? ` · ${esc(x.duration)} min`
                : ""
            }

          </span>

        </div>


        <div class="item-actions">

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


/* =========================================================
   TREINOS
   ========================================================= */

function treinos() {

  return listPage({

    key: "treinos",

    title: "Treinos",

    subtitle:
      "Registre seus movimentos e mantenha constância.",

    eyebrow: "BEM-ESTAR",

    render: x => `

      <div class="list-item">


        <div class="module-icon small">
          ♢
        </div>


        <div class="item-main">

          <strong>
            ${esc(x.name)}
          </strong>

          <span>

            ${
              x.type || "Treino"
            }

            ${
              x.duration
                ? ` · ${esc(x.duration)} min`
                : ""
            }

          </span>

        </div>


        <div class="item-actions">

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

function hidratacao() {

  const total =
    state.data.hidratacao
      .reduce(
        (s, x) =>
          s + Number(x.amount || 0),
        0
      );


  const goal = 2000;


  const pct =
    Math.min(
      100,
      Math.round(total / goal * 100)
    );


  return appShell(`

    ${pageHeader(

      "BEM-ESTAR",

      "Hidratação",

      "Pequenos registros ajudam a cuidar da sua rotina.",

      `
        <button
          class="primary-button compact"
          data-action="add-hidratacao"
        >
          ${icon("plus")}
          Registrar
        </button>
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
            de ${goal} ml registrados
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

        <span>0 ml</span>

        <strong>
          ${pct}%
        </strong>

        <span>
          ${goal} ml
        </span>

      </div>


      <div class="quick-water">

        ${[200, 300, 500]
          .map(v => `

            <button
              data-action="quick-water"
              data-value="${v}"
            >
              +${v} ml
            </button>

          `)
          .join("")}

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
        state.data.hidratacao.length

          ? `

            <div class="item-list">

              ${state.data.hidratacao
                .map(x => `

                  <div class="list-item">

                    <div class="module-icon small">
                      ◉
                    </div>

                    <div class="item-main">

                      <strong>
                        ${x.amount} ml
                      </strong>

                      <span>

                        ${
                          new Date(
                            x.createdAt
                          ).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit"
                            }
                          )
                        }

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

                `)
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
   FINANÇAS
   ========================================================= */

function financas() {

  const income =
    state.data.financas
      .filter(x => x.type === "income")
      .reduce(
        (s, x) =>
          s + Number(x.value),
        0
      );


  const expense =
    state.data.financas
      .filter(x => x.type === "expense")
      .reduce(
        (s, x) =>
          s + Number(x.value),
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

    render: x => `

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
