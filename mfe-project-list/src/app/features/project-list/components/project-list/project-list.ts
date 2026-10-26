import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-project-list',
  imports: [],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList {
  projetosRecebidos = input<Projeto[]>([]);
  eventTelaNovoProjeto = output();
  eventEdicao = output<string>();
  eventExclusao = output<string>();
  eventProjetoSelecionado = output<string>();

  // Modal de confirmação (substitui window.confirm)
  modalExclusaoAberto = false;
  projetoPendenteExclusao: string | null = null;
  numeroPendenteExclusao: number | null = null;

  // Paginação (5 por página)
  readonly itensPorPagina = 5;
  paginaAtual = signal(1);

  projetosPaginados = computed(() => {
    const todos = this.projetosRecebidos();
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return todos.slice(inicio, inicio + this.itensPorPagina);
  });

  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.projetosRecebidos().length / this.itensPorPagina)),
  );

  constructor() { }

  enviarEventTelaNovoProjeto() {
    this.eventTelaNovoProjeto.emit();
  }

  irParaPagina(pagina: number): void {
    const total = this.totalPaginas();
    if (pagina < 1 || pagina > total) return;
    this.paginaAtual.set(pagina);
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual() - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual() + 1);
  }

  /** Número de exibição (1..N) — calculado pela posição na lista.
   *  Se o 10 for excluído, o 11 vira 10 automaticamente.
   *  O hash continua como ID real nas operações. */
  numeroDe(id: string): number {
    return this.projetosRecebidos().findIndex((p) => p.id === id) + 1;
  }

  capturarEventos(event: MouseEvent, operacao: 'EDITAR' | 'SELECIONAR' | 'EXCLUIR', idProjeto: string) {
    event.stopPropagation();
    switch (operacao) {
      case 'EDITAR':
        this.eventEdicao.emit(idProjeto);
        break;
      case 'EXCLUIR':
        this.projetoPendenteExclusao = idProjeto;
        this.numeroPendenteExclusao = this.numeroDe(idProjeto);
        this.modalExclusaoAberto = true;
        break;
      case 'SELECIONAR':
        this.eventProjetoSelecionado.emit(idProjeto);
    }

  }

  confirmarExclusao(): void {
    if (this.projetoPendenteExclusao != null) {
      this.eventExclusao.emit(this.projetoPendenteExclusao);
    }
    this.fecharModalExclusao();
  }

  fecharModalExclusao(): void {
    this.modalExclusaoAberto = false;
    this.projetoPendenteExclusao = null;
    this.numeroPendenteExclusao = null;
  }
}
