# crud-project-list
Web Component Angular para gestão de workspaces de infraestrutura. Implementa operações CRUD via REST e exporta a tag isolada &lt;project-list>.

# GUIA CRUD 1 — <project-list> (Pai) — Gerenciador de Projetos

> **Equipe 1 | 4 pessoas | Objetivo: entregar URL funcionando em 29/09/2026**
> **Stack:** Angular 21 + CSS + MockServer + Web Component + Vercel (Docker opcional)
> **Entrega final:** `https://sua-url.vercel.app/main.js` registrando `customElements.define('project-list')` e plugando na casca `atividadengx` via `public/microfrontends.json`

---

## 0. Visão Geral — O que vocês vão construir

Vocês são a **Equipe Pai**. Vocês entregam o **<project-list>** que cadastra projetos e **emite** o projeto selecionado.

**Dados obrigatórios:**

```ts
interface Project { id: number; name: string; environment: 'dev' | 'prod'; }
```

**Ações:** Criar, Listar, Editar, Excluir, **Selecionar** (emite evento).

**Comunicação com a Equipe 2:**

```ts
// Quando clicar num projeto:
this.dispatchEvent(new CustomEvent('project-selected', { detail: { projectId: '123' } }));
// A página pai captura e passa para <member-manager project-id="123">
```

**Fluxo completo:**
`Usuário clica projeto em <project-list>` -> `evento project-selected` -> `página seta attribute project-id no <member-manager>` -> `member-manager filtra membros`.

**5 fases do projeto (resumidas em 3 entregas):**

| Fase | O que é | Quando entrega |
|---|---|---|
| 1. CRUD | Interface + lógica local (array) | Semana 1 |
| 2. MockServer | `json-server` simulando API REST | Semana 2 |
| 3. Permissões | (neste CRUD não tem permissão, só validação de name) | Semana 2 |
| 4. Web Component | `@angular/elements` + `customElements.define('project-list')` | Semana 3 |
| 5. Deploy | Vercel com `vercel.json` + `CORS *` | Semana 3 |

**Cronograma real (3 semanas):**

- **Dia 1: 09/09/2026 (ontem)**
- **Entrega 1 — 15/09/2026:** CRUD local funcionando (sem servidor)
- **Entrega 2 — 22/09/2026:** com MockServer + validação
- **Entrega 3 — 29/09/2026:** Web Component + URL Vercel (obrigatório) + Docker opcional

> **Minigame:** Cada semana é um Level. Level 1 = array local, Level 2 = API fake, Level 3 = Boss final Web Component + Vercel. Se passarem Level 1, ganham 30% da nota.

---

## 1. Arquitetura SUPER Simples (não usem Clean complexa)

Usem esta pasta **simples**:

```
project-list/
  src/app/
    app.component.ts        # só roteia
    app.config.ts           # provider HttpClient
    features/project-list/
      project.model.ts      # interface Project
      project.service.ts    # fala com json-server
      project-list.component.ts/html/css  # tudo do CRUD aqui
  public/silent-check-sso.html  # só se usar Keycloak (não precisa para este CRUD básico)
  db.json                   # para json-server
  vercel.json
  Dockerfile (opcional)
```

**Por que simples?** Vocês se dividem em 4 sem se atropelar.

---

## 2. Divisão de Tarefas para 4 Pessoas (sem falar que são iniciantes no doc)

| Pessoa | Apelido | Foco | Entregáveis |
|---|---|---|---|
| **A** | `Arquiteto` | Setup + Modelo + Rotas | `ng new`, `project.model.ts`, `app.config.ts` |
| **B** | `Designer` | HTML + CSS | `project-list.component.html` + `.css` (form + tabela bonita) |
| **C** | `Lógica` | TypeScript CRUD local → Service | `project-list.component.ts` (CRUD array), depois `project.service.ts` |
| **D** | `Deploy Master` | MockServer + Web Component + Vercel | `db.json`, `json-server`, `@angular/elements`, `vercel.json`, `Dockerfile` opcional |

**Como trabalhar sem conflito:** `A` cria o projeto e commita, `B` só mexe em `.html/.css`, `C` só em `.ts`, `D` só em `db.json/vercel.json/Dockerfile`. Façam `git pull` todo dia.

---

## 3. SEMANA 1 — Entrega 15/09: CRUD Local (Level 1)

**Objetivo:** Ao final da semana, `ng serve` mostra form + lista funcionando só com array, sem servidor.

### Passo 0 — Pessoa A (30 min, Dia 09/09)

```bash
npx @angular/cli@21 new project-list --standalone --style=css --routing=false
cd project-list
npm install
code .
```

Explicação: `--standalone` é Angular moderno sem `NgModule`, `--routing=false` porque é um componente só.

Crie `src/app/features/project-list/project.model.ts`:

```ts
// project.model.ts - Molde dos dados, garante que todo projeto tem id, name, environment
export interface Project {
  id: number; // ou string, mas usem number para simplificar com json-server
  name: string;
  environment: 'dev' | 'prod'; // só pode ser dev ou prod, nada mais
}
```

Crie `src/app/app.config.ts` (se não existir):

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()] // libera HttpClient para semana 2
};
```

### Passo 1 — Pessoa B (Dias 10-11/09) — HTML + CSS

`project-list.component.html`:

```html
<h2>Gerenciador de Projetos</h2>

<!-- FORM: captura name + environment -->
<div class="form">
  <input [(ngModel)]="name" placeholder="Nome do projeto" />
  <select [(ngModel)]="environment">
    <option value="dev">dev</option>
    <option value="prod">prod</option>
  </select>
  <button (click)="addProject()" [disabled]="!name.trim()">Criar</button>
  <button *ngIf="editing" (click)="updateProject()">Salvar</button>
  <button *ngIf="editing" (click)="cancelEdit()">Cancelar</button>
</div>

<!-- LISTA: mostra projetos -->
<table>
  <tr *ngFor="let p of projects">
    <td>#{{p.id}} {{p.name}} ({{p.environment}})</td>
    <td>
      <button (click)="selectProject(p)">Selecionar</button>
      <button (click)="editProject(p)">Editar</button>
      <button (click)="deleteProject(p.id)">Excluir</button>
    </td>
  </tr>
</table>
<p *ngIf="selectedId">Selecionado: {{selectedId}}</p>
```

`project-list.component.css`:

```css
.form { display: grid; gap: 8px; max-width: 400px; margin-bottom: 16px; }
input, select { padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; }
button { padding: 6px 12px; border-radius: 8px; border: 1px solid #d1d5db; cursor: pointer; }
button:disabled { opacity: 0.5; }
table { width: 100%; border-collapse: collapse; }
td { padding: 8px; border-bottom: 1px solid #eee; }
```

### Passo 2 — Pessoa C (Dias 12-14/09) — Lógica TypeScript

`project-list.component.ts`:

```ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from './project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // precisa para *ngFor e [(ngModel)]
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent {
  // DADOS: array local, simula banco
  projects: Project[] = [
    { id: 1, name: 'Site NGX', environment: 'prod' },
    { id: 2, name: 'App Teste', environment: 'dev' }
  ];
  nextId = 3;
  // FORM
  name = '';
  environment: 'dev' | 'prod' = 'dev';
  editing: Project | null = null;
  selectedId: number | null = null;

  // COMUNICAÇÃO PAI -> CASCA: quando selecionar, avisa fora do componente
  @Output() projectSelected = new EventEmitter<{ projectId: number }>();

  // CREATE: adiciona no array
  addProject() {
    if (!this.name.trim()) return; // validação Semana 2 já aqui
    this.projects.push({ id: this.nextId++, name: this.name.trim(), environment: this.environment });
    this.name = '';
  }
  // READ: já é o *ngFor
  // UPDATE:
  editProject(p: Project) { this.editing = p; this.name = p.name; this.environment = p.environment; }
  updateProject() {
    if (!this.editing || !this.name.trim()) return;
    this.editing.name = this.name.trim();
    this.editing.environment = this.environment;
    this.cancelEdit();
  }
  cancelEdit() { this.editing = null; this.name = ''; this.environment = 'dev'; }
  // DELETE:
  deleteProject(id: number) {
    if (!confirm(`Excluir projeto #${id}?`)) return; // regra Semana 2 já aqui
    this.projects = this.projects.filter(p => p.id !== id);
  }
  // SELECT: emite evento nativo para a casca pegar
  selectProject(p: Project) {
    this.selectedId = p.id;
    // Evento que a página vai ouvir: <project-list> dispara, página captura e passa para <member-manager>
    this.dispatchEvent(new CustomEvent('project-selected', { detail: { projectId: p.id }, bubbles: true, composed: true }));
    this.projectSelected.emit({ projectId: p.id }); // também para Angular pai
  }
}
```

**Explicação código acima (para quem nunca programou):**
- `projects: Project[]` é a "tabela" na memória.
- `addProject` empurra novo objeto com `push` e incrementa `nextId`.
- `deleteProject` filtra o array removendo o id.
- `selectProject` faz **duas coisas**: guarda `selectedId` e **dispara evento** `project-selected` com `detail.projectId`. O `bubbles:true` faz o evento subir até a página.

**Teste Semana 1:** `npm start` -> `http://localhost:4200` -> Criar/Editar/Excluir/Selecionar deve funcionar. **Entrega: print da tela + código no Git.**

---

## 4. SEMANA 2 — Entrega 22/09: MockServer + Validação (Level 2)

**Objetivo:** Trocar array local por API fake `json-server`.

### Pessoa D — MockServer (Dia 16/09, 20 min)

```bash
npm i -g json-server
# ou local: npm i -D json-server
```

Crie `db.json` na raiz:

```json
{
  "projects": [
    { "id": 1, "name": "Site NGX", "environment": "prod" },
    { "id": 2, "name": "App Teste", "environment": "dev" }
  ]
}
```

Rode:

```bash
json-server --watch db.json --port 3001
# testa: http://localhost:3001/projects
```

### Pessoa C — Service Angular (Dias 17-19/09)

`project.service.ts`:

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from './project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private api = 'http://localhost:3001/projects'; // json-server
  constructor(private http: HttpClient) {}
  getProjects() { return this.http.get<Project[]>(this.api); } // GET
  addProject(p: Omit<Project,'id'>) { return this.http.post<Project>(this.api, p); } // POST
  updateProject(p: Project) { return this.http.put<Project>(`${this.api}/${p.id}`, p); } // PUT
  deleteProject(id: number) { return this.http.delete(`${this.api}/${id}`); } // DELETE
}
```

Agora troque `project-list.component.ts` para usar serviço (exemplo `load`):

```ts
// no ngOnInit:
ngOnInit(){ this.service.getProjects().subscribe(data=> this.projects=data); }
// addProject:
addProject(){
  if(!this.name.trim()) return;
  this.service.addProject({name:this.name, environment:this.environment}).subscribe(created=>{
    this.projects.push(created); this.name='';
  });
}
```

**Validação (Semana 2 regra):**
- `if (!name.trim()) return;` impede nome vazio
- `if (!confirm(...)) return;` antes de excluir (já está no código Semana 1)

**Entrega Semana 2:** `db.json` + `project.service.ts` funcionando, `ng serve` + `json-server` rodando juntos. **Print do `http://localhost:3001/projects` retornando JSON.**

---

## 5. SEMANA 3 — Entrega 29/09: Web Component + Deploy Vercel (Boss Final) — OBRIGATÓRIO

### 5.1. Web Component (Pessoa D + A, Dias 23-25/09)

```bash
ng add @angular/elements
npm install @angular/elements
```

Edite `src/main.ts`:

```ts
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { appConfig } from './app/app.config';
import { ProjectListComponent } from './app/features/project-list/project-list.component';

const tag = 'project-list'; // IMPORTANTE: com hífen, único na casca
async function defineElement(){
  if (customElements.get(tag)) return; // guard
  const app = await createApplication(appConfig);
  const el = createCustomElement(ProjectListComponent, { injector: app.injector });
  customElements.define(tag, el);
}
// Suporte aos dois modos: standalone dev e Web Component na casca
if (document.querySelector(tag) || location.search.includes('element')) void defineElement();
else { import('./app/app.component').then(m=>{ import('@angular/platform-browser').then(({bootstrapApplication})=>bootstrapApplication(m.AppComponent, appConfig)); }); void defineElement(); }
```

No componente, adicione `encapsulation: ViewEncapsulation.ShadowDom` para isolar CSS:

```ts
@Component({ ..., encapsulation: ViewEncapsulation.ShadowDom })
```

Explicação: `createCustomElement` embrulha o Angular em um `HTMLElement` que o browser entende como `<project-list>`. A casca (`src/main.ts:193` da casca) faz `customElements.get('project-list')` para não redefinir.

### 5.2. Deploy Vercel (Pessoa D, Dias 26-27/09) — OBRIGATÓRIO

Obrigatório ter **URL pública** até 29/09.

1. Crie `vercel.json` na raiz:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Explicação: SPA precisa `try_files` (igual `nginx.conf:7` da casca). Vercel sem isso dá 404 ao dar F5.

2. `ng build --configuration production` gera `dist/project-list/browser`.

3. Push para GitHub e conecte no painel Vercel (Import Project). Vercel detecta Angular, `Build Command: ng build`, `Output: dist/project-list/browser`.

4. Após deploy, teste: `https://seu-project-list.vercel.app/main.js` deve retornar `200` e `https://seu-project-list.vercel.app/` deve mostrar o CRUD.

**Header CORS (importante para casca):** Na Vercel, adicione em `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{ "source": "/main.js", "headers": [{ "key": "Access-Control-Allow-Origin", "value": "*" }] }, { "source": "/(.*).js", "headers": [{ "key": "Access-Control-Allow-Origin", "value": "*" }] }]
}
```

Sem isso a casca em `http://localhost:3000` falha ao buscar `https://.../main.js` (CORS).

5. **Build estável:** Angular gera `main-ABC123.js` hasheado. Para a casca precisa de `main.js` estável. Se seu `angular.json` tem `outputHashing: all`, crie `scripts/postbuild.js` que copia `main-*.js` para `main.js` ou desative hash para `main.js` (ver `Requisitos-Microfrontend.md:72`).

### 5.3. Docker Opcional (só se quiser aprender Docker)

Se quiser, copie `Dockerfile` e `nginx.conf` da casca (`Dockerfile:1`, `nginx.conf:1`) e ajuste `COPY --from=build /app/dist/project-list/browser /usr/share/nginx/html`. Não é obrigatório para Vercel.

---

## 6. Como testar na Casca

Após deploy, informe ao time da casca:

```json
{ "tag": "project-list", "title": "Projects", "url": "https://seu-project-list.vercel.app/main.js" }
```

Eles adicionam em `atividadengx/public/microfrontends.json` e fazem `F5` em `http://localhost:3000` — seu `<project-list>` aparece na sidebar.

Para testar local antes da casca, crie `index.html` teste:

```html
<project-list></project-list>
<script type="module" src="http://localhost:4200/main.js"></script>
<script>
  document.addEventListener('project-selected', e => console.log('ID selecionado', e.detail.projectId));
</script>
```

---

## 7. Checklist Entrega Final 29/09

- [ ] `https://sua-url.vercel.app/` abre CRUD
- [ ] `https://sua-url.vercel.app/main.js` 200 + CORS *
- [ ] `customElements.get('project-list')` existe após carregar
- [ ] Criar/Editar/Excluir/Selecionar funciona (com json-server local ou API)
- [ ] Evento `project-selected` dispara com `detail.projectId`
- [ ] Shadow DOM isolado (CSS não vaza)
- [ ] `vercel.json` com rewrites + headers
- [ ] Código no GitHub + URL entregue

---

## 8. Dicas Minigame

- **Level 1 (15/09):** Se o `confirm` e validação de `name` já estiverem, ganham bônus.
- **Level 2 (22/09):** Se `http://localhost:3001/projects` listar os 2 iniciais, passaram.
- **Boss (29/09):** Se `<project-list>` aparecer na casca sem rebuild, **ZERARAM O JOGO**.

Qualquer dúvida, leia `CONEXAO-MICROFRONTEND.md` seção 1.1 e `example-users-crud/main.js` como template vanilla.

