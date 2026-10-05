import { Component, input, output } from '@angular/core';

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

  constructor() { }

  enviarEventTelaNovoProjeto() {
    this.eventTelaNovoProjeto.emit();
  }

  capturarEventos(event: MouseEvent, operacao: 'EDITAR' | 'SELECIONAR' | 'EXCLUIR', idProjeto: string) {
    event.stopPropagation();
    switch (operacao) {
      case 'EDITAR':
        this.eventEdicao.emit(idProjeto);
        break;
      case 'EXCLUIR':
        var resposta = window.confirm("Deseja excluir esse Projeto?");
        if (resposta) {
          this.eventExclusao.emit(idProjeto);
        }
        break;
      case 'SELECIONAR':
        this.eventProjetoSelecionado.emit(idProjeto);
    }

  }

}