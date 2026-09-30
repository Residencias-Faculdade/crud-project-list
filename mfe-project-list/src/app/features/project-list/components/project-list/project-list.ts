import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-project-list',
  imports: [],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList {
  projetosRecebidos = input<Projeto[]>([]);
  eventEdicao = output<string>();
  eventTelaNovoProjeto = output();
  eventExclusao = output<string>();

  constructor() { }

  enviarEventEdicao(id: string) {
    this.eventEdicao.emit(id);
  }

  enviarEventTelaNovoProjeto() {
    this.eventTelaNovoProjeto.emit();
  }

  enviarEventExclusao(idProjeto: string) {
    var resposta = window.confirm("Deseja excluir esse Projeto?");

    if (resposta) {
      this.eventExclusao.emit(idProjeto);
    }
  }
}
