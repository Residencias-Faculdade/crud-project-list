type Projeto = {
  id: string,
  nome: string,
  ambiente: 'dev' | 'prod'
}

type TipoOperacao = 'EDITAR' | 'CRIAR'

interface Operacao {
  tipoOperacao: TipoOperacao,
  infoProjeto: Projeto
}