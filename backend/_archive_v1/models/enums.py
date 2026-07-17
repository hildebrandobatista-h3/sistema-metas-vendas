import enum


class PapelUsuario(str, enum.Enum):
    ADMIN = "ADMIN"
    DIRETOR = "DIRETOR"
    GERENTE = "GERENTE"
    VENDEDOR = "VENDEDOR"


class TipoNo(str, enum.Enum):
    EMPRESA = "EMPRESA"
    UNIDADE = "UNIDADE"
    DIRETOR = "DIRETOR"
    GERENTE = "GERENTE"
    VENDEDOR = "VENDEDOR"


class StatusCompetencia(str, enum.Enum):
    ABERTA = "ABERTA"
    PUBLICADA = "PUBLICADA"
    FECHADA = "FECHADA"


class TipoMedida(str, enum.Enum):
    VALOR = "VALOR"
    QUANTIDADE = "QUANTIDADE"


class StatusMeta(str, enum.Enum):
    RASCUNHO = "RASCUNHO"
    PUBLICADA = "PUBLICADA"


class OrigemVenda(str, enum.Enum):
    MANUAL = "MANUAL"
    INTEGRACAO = "INTEGRACAO"


class AcaoVendaHistorico(str, enum.Enum):
    EDICAO = "EDICAO"
    EXCLUSAO = "EXCLUSAO"


class AcaoFechamento(str, enum.Enum):
    FECHOU = "FECHOU"
    REABRIU = "REABRIU"
