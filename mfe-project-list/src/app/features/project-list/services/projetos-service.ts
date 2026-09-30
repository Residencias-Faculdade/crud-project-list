import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private url = "http://localhost:1080/projetos";
  private readonly MINIMO_CARACTERES = 9;
  constructor(private httpClient: HttpClient) { }

  private quantidade_projetos: number = 10;

  buscarTodos() {
    return this.httpClient.get<Projeto[]>(this.url);
  }

  criarNovoProjeto(novoProjeto: Projeto) {
    var nomeProjeto: string = novoProjeto.nome;

    if (!this.validarNome(nomeProjeto)) {
      alert("Nome inválido, poucos caracteres.");
      return null;
    }

    novoProjeto.id = this.gerarNovoId();
    console.log(novoProjeto.id);
    return this.httpClient.post(this.url, novoProjeto);
  }

  editarProjeto(projetoEditado: Projeto) {
    var nomeProjeto: string = projetoEditado.nome;

    if (!this.validarNome(nomeProjeto)) {
      alert("Nome inválido, poucos caracteres.");
      return null;
    }

    return this.httpClient.put<Projeto>(this.url + `/${projetoEditado.id}`, projetoEditado)
  }

  excluirProjeto(idProjeto: string) {
    return this.httpClient.delete<Projeto>(this.url + `/${idProjeto}`)
  }

  private validarNome(nomeProjeto: string): boolean {
    var analiseNome = nomeProjeto.trim();
    return analiseNome.length < this.MINIMO_CARACTERES;
  }

  private gerarNovoId(): string {
    this.quantidade_projetos += 1;
    return this.quantidade_projetos.toString();
  }
}
