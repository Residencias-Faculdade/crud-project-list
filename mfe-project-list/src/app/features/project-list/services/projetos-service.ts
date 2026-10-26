import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private url = "http://localhost:1080/projetos";
  private readonly MINIMO_CARACTERES = 9;
  private quantidade_projetos: number = 0;

  constructor(private httpClient: HttpClient) { }

  buscarTodos() {
    var projetos = this.httpClient.get<Projeto[]>(this.url)
    return projetos;
  }

  criarNovoProjeto(novoProjeto: Projeto) {
    if (!this.validarNome(novoProjeto.nome)) {
      return null;
    }

    novoProjeto.id = this.gerarNovoId();
    return this.httpClient.post(this.url, novoProjeto);
  }

  editarProjeto(projetoEditado: Projeto) {
    if (!this.validarNome(projetoEditado.nome)) {
      return null;
    }

    return this.httpClient.put<Projeto>(this.url + `/${projetoEditado.id}`, projetoEditado)
  }

  excluirProjeto(idProjeto: string) {
    return this.httpClient.delete<Projeto>(this.url + `/${idProjeto}`)
  }

  private validarNome(nomeProjeto: string): boolean {
    var analiseNome = nomeProjeto.trim();
    return analiseNome.length > this.MINIMO_CARACTERES;
  }

  private gerarNovoId(): string {
    // Usa timestamp + aleatório para nunca colidir (json-server dá 500 em id duplicado)
    return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
  }

  public definirQuantidadeProjetos(quantidadeProjetos: number) {
    this.quantidade_projetos = quantidadeProjetos;
  }
}