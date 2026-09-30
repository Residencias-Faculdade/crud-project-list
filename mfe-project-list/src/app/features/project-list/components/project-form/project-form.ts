import { Component, OnInit, input, output } from '@angular/core';
import { FormsModule } from "@angular/forms"

type Exibicao = 'EDITAR' | 'CRIAR';

@Component({
  selector: 'app-project-form',
  imports: [],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css',
})
export class ProjectForm implements OnInit {
  eventVoltarPagina = output();
  eventOperacaoRealizada = output<Operacao>()
  receberExibicao = input<Exibicao>("CRIAR"); // Visualização padrão, para caso de bugs
  receberDadosEdicao = input<Projeto>({
    id: "",
    nome: "",
    ambiente: "dev"
  });
  //Criei um outro objeto apenas para evitar erros de referência
  bindingDadosProjeto: Projeto = {
    id: "",
    nome: "",
    ambiente: "dev"
  };

  constructor() { }

  ngOnInit() {
    if (this.receberExibicao() == "EDITAR") {
      this.bindingDadosProjeto = { ...this.receberDadosEdicao() }
      console.log(this.bindingDadosProjeto)
    }
  }

  enviarEventOperacaoRealizada(tipoOperacao: "EDITAR" | "CRIAR") {
    this.eventOperacaoRealizada.emit({
      tipoOperacao,
      infoProjeto: { ...this.bindingDadosProjeto }
    })
  }

  enviarEventVoltarPagina() {
    this.eventVoltarPagina.emit();
  }
}
