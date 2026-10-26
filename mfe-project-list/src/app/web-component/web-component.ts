import { Component, OnInit, output, signal, Signal } from '@angular/core';
import { ProjectList } from '../features/project-list/components/project-list/project-list';
import { ProjectForm } from '../features/project-list/components/project-form/project-form';
import { ProjetosService } from '../features/project-list/services/projetos-service';

@Component({
  selector: 'app-web-component',
  imports: [ProjectList, ProjectForm],
  templateUrl: './web-component.html',
  styleUrl: './web-component.css',
})
export class WebComponent implements OnInit {
  pagina = signal<"LIST" | "FORM">("LIST");
  repassarDadosEdicao: Projeto = {
    id: "",
    nome: "",
    ambiente: "dev"
  };
  repassarModeloExibicao: "CRIAR" | "EDITAR" = "CRIAR";
  repassarDadosProjetos = signal<Projeto[]>([]);
  projetoSelecionado = output<string>({ alias: "project-selected" });

  // Modal de validação (substitui alert)
  modalErroAberto = false;
  modalErroMsg = '';

  constructor(private projetoService: ProjetosService) { }

  ngOnInit() {
    //No inicio, irei consumir os dados da api e repassar para o component de Listagem
    //Deixei o component pai responsavel por isso, para evitar varias requisições na API
    this.consumirDadosProjetos();
  }


  //Refatorando o form-project
  criarNovoProjeto(novoProjeto: Projeto) {
    const req = this.projetoService.criarNovoProjeto(novoProjeto);
    if (!req) {
      this.abrirModalErro('Nome inválido: use mais de 9 caracteres.');
      return;
    }
    req.subscribe({
      next: (projeto) => {
        this.repassarDadosProjetos.update(projetos => [...projetos, projeto as Projeto])
      },
      error: (erro) => this.abrirModalErro('Falha ao criar projeto. Tente novamente.')
    });
  }

  editarProjeto(projetoEditado: Projeto) {
    const req = this.projetoService.editarProjeto(projetoEditado);
    if (!req) {
      this.abrirModalErro('Nome inválido: use mais de 9 caracteres.');
      return;
    }
    req.subscribe({
      next: () => {
        this.repassarDadosProjetos.update(arrayProjetos =>
          arrayProjetos.map(
            projetoAtual => projetoAtual.id === projetoEditado.id ? projetoAtual = { ...projetoEditado } : projetoAtual
          ));
      },
      error: (erro) => this.abrirModalErro('Falha ao editar projeto. Tente novamente.')
    })
  }

  abrirModalErro(msg: string): void {
    this.modalErroMsg = msg;
    this.modalErroAberto = true;
  }

  fecharModalErro(): void {
    this.modalErroAberto = false;
    this.modalErroMsg = '';
  }

  escutarEventoTelaEdicao(idProjeto: string) {
    this.repassarModeloExibicao = "EDITAR";
    var dadosProjeto: Projeto = this.repassarDadosProjetos().find((projetoAtual) => projetoAtual.id === idProjeto) as Projeto;
    this.repassarDadosEdicao = { ...dadosProjeto };
    this.alterarPagina();
  }

  escutarEventoTelaCriacao() {
    this.repassarModeloExibicao = "CRIAR";
    this.alterarPagina();
  }

  escutarEventoVoltarPagina() {
    this.alterarPagina();
  }

  escutarEventoOperacao(operacao: Operacao) {
    switch (operacao.tipoOperacao) {
      case 'CRIAR':
        this.criarNovoProjeto(operacao.infoProjeto);
        break;
      case 'EDITAR':
        console.log(operacao.infoProjeto.nome)
        this.editarProjeto(operacao.infoProjeto);
        break;
    }
    this.alterarPagina()
  }

  escutarEventoExclusao(idProjeto: string) {
    this.projetoService.excluirProjeto(idProjeto)
      .subscribe({
        next: () => this.repassarDadosProjetos.update((projetos) =>
          projetos.filter((projetoAtual) => projetoAtual.id !== idProjeto))
        ,
        error: (erro) => this.abrirModalErro('Falha ao excluir projeto. Tente novamente.')
      })
  }

  escutarEventoProjetoSelecionado(idProjeto: string) {
    // Propaga para a shell + outros MFEs via DOM event e localStorage
    this.projetoSelecionado.emit(idProjeto);
    try {
      localStorage.setItem('selectedProjectId', idProjeto);
      window.dispatchEvent(new CustomEvent('project-selected', { detail: idProjeto }));
    } catch { /* ignore */ }
  }

  alterarPagina() {
    if (this.pagina() == "LIST") {
      this.pagina.set("FORM");
    } else {
      this.pagina.set("LIST");
    }
  }

  private consumirDadosProjetos() {
    this.projetoService.buscarTodos()
      .subscribe({
        next: (projetosRecebidos) => {
          this.projetoService.definirQuantidadeProjetos(projetosRecebidos.length);
          this.repassarDadosProjetos.set(projetosRecebidos);
        },
        error: (erro) => console.log(erro)
      })
  }
}
