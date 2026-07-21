--
-- PostgreSQL database dump
--

\restrict 4e1TAtbPchA5v9aZLVFniQA8kslrX6OJLeZoFU4himQvR2DTSyt5YOBHCifZQQ1

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO metas_user;

--
-- Name: empresa; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.empresa (
    id integer NOT NULL,
    nome character varying(120) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer
);


ALTER TABLE public.empresa OWNER TO metas_user;

--
-- Name: empresa_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.empresa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.empresa_id_seq OWNER TO metas_user;

--
-- Name: empresa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.empresa_id_seq OWNED BY public.empresa.id;


--
-- Name: gerente; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.gerente (
    id integer NOT NULL,
    unidade_id integer NOT NULL,
    nome character varying(120) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer
);


ALTER TABLE public.gerente OWNER TO metas_user;

--
-- Name: gerente_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.gerente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gerente_id_seq OWNER TO metas_user;

--
-- Name: gerente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.gerente_id_seq OWNED BY public.gerente.id;


--
-- Name: meta; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.meta (
    id integer NOT NULL,
    vendedor_id integer NOT NULL,
    produto_id integer NOT NULL,
    periodo_id integer NOT NULL,
    valor numeric(15,2) NOT NULL,
    empresa_id integer NOT NULL,
    unidade_id integer NOT NULL,
    gerente_id integer NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer,
    CONSTRAINT ck_meta_valor_positivo CHECK ((valor >= (0)::numeric))
);


ALTER TABLE public.meta OWNER TO metas_user;

--
-- Name: meta_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.meta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.meta_id_seq OWNER TO metas_user;

--
-- Name: meta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.meta_id_seq OWNED BY public.meta.id;


--
-- Name: oportunidade_nectar; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.oportunidade_nectar (
    id integer NOT NULL,
    param_integracao_id integer NOT NULL,
    id_oportunidade_ext integer NOT NULL,
    nome character varying(255) NOT NULL,
    cliente character varying(255),
    valor numeric(15,2),
    status_sincronizacao character varying(20) DEFAULT 'pendente'::character varying NOT NULL,
    data_sincronizacao timestamp with time zone,
    mensagem_erro character varying(500),
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer
);


ALTER TABLE public.oportunidade_nectar OWNER TO metas_user;

--
-- Name: oportunidade_nectar_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.oportunidade_nectar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.oportunidade_nectar_id_seq OWNER TO metas_user;

--
-- Name: oportunidade_nectar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.oportunidade_nectar_id_seq OWNED BY public.oportunidade_nectar.id;


--
-- Name: param_integracao; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.param_integracao (
    id integer NOT NULL,
    tipo_integracao character varying(50) NOT NULL,
    token character varying(1000) NOT NULL,
    endpoint_base character varying(255) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    ultima_sincronizacao timestamp with time zone,
    status_ultimo_teste character varying(20),
    mensagem_erro character varying(500),
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer
);


ALTER TABLE public.param_integracao OWNER TO metas_user;

--
-- Name: param_integracao_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.param_integracao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.param_integracao_id_seq OWNER TO metas_user;

--
-- Name: param_integracao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.param_integracao_id_seq OWNED BY public.param_integracao.id;


--
-- Name: periodo; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.periodo (
    id integer NOT NULL,
    ano integer NOT NULL,
    mes integer NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer,
    CONSTRAINT ck_periodo_ano_valido CHECK (((ano >= 2000) AND (ano <= 2100))),
    CONSTRAINT ck_periodo_mes_valido CHECK (((mes >= 1) AND (mes <= 12)))
);


ALTER TABLE public.periodo OWNER TO metas_user;

--
-- Name: periodo_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.periodo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.periodo_id_seq OWNER TO metas_user;

--
-- Name: periodo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.periodo_id_seq OWNED BY public.periodo.id;


--
-- Name: produto; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.produto (
    id integer NOT NULL,
    nome character varying(80) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer
);


ALTER TABLE public.produto OWNER TO metas_user;

--
-- Name: produto_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.produto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.produto_id_seq OWNER TO metas_user;

--
-- Name: produto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.produto_id_seq OWNED BY public.produto.id;


--
-- Name: realizado; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.realizado (
    id integer NOT NULL,
    vendedor_id integer NOT NULL,
    produto_id integer NOT NULL,
    data_venda date NOT NULL,
    valor numeric(15,2) NOT NULL,
    origem character varying(20) DEFAULT 'manual'::character varying NOT NULL,
    descricao character varying(255),
    empresa_id integer NOT NULL,
    unidade_id integer NOT NULL,
    gerente_id integer NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer,
    CONSTRAINT ck_realizado_origem CHECK (((origem)::text = ANY ((ARRAY['manual'::character varying, 'nectar'::character varying])::text[]))),
    CONSTRAINT ck_realizado_valor_positivo CHECK ((valor >= (0)::numeric))
);


ALTER TABLE public.realizado OWNER TO metas_user;

--
-- Name: realizado_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.realizado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.realizado_id_seq OWNER TO metas_user;

--
-- Name: realizado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.realizado_id_seq OWNED BY public.realizado.id;


--
-- Name: unidade; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.unidade (
    id integer NOT NULL,
    empresa_id integer NOT NULL,
    nome character varying(120) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer
);


ALTER TABLE public.unidade OWNER TO metas_user;

--
-- Name: unidade_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.unidade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.unidade_id_seq OWNER TO metas_user;

--
-- Name: unidade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.unidade_id_seq OWNED BY public.unidade.id;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    login character varying(60) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    perfil character varying(20) NOT NULL,
    nome character varying(120) NOT NULL,
    gerente_id integer,
    vendedor_id integer,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer,
    CONSTRAINT ck_usuario_perfil CHECK (((perfil)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying, 'vendedor'::character varying])::text[])))
);


ALTER TABLE public.usuario OWNER TO metas_user;

--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuario_id_seq OWNER TO metas_user;

--
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- Name: vendedor; Type: TABLE; Schema: public; Owner: metas_user
--

CREATE TABLE public.vendedor (
    id integer NOT NULL,
    gerente_id integer NOT NULL,
    nome character varying(120) NOT NULL,
    ref_externa character varying(80),
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por integer,
    atualizado_por integer
);


ALTER TABLE public.vendedor OWNER TO metas_user;

--
-- Name: vendedor_id_seq; Type: SEQUENCE; Schema: public; Owner: metas_user
--

CREATE SEQUENCE public.vendedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendedor_id_seq OWNER TO metas_user;

--
-- Name: vendedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metas_user
--

ALTER SEQUENCE public.vendedor_id_seq OWNED BY public.vendedor.id;


--
-- Name: empresa id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id SET DEFAULT nextval('public.empresa_id_seq'::regclass);


--
-- Name: gerente id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.gerente ALTER COLUMN id SET DEFAULT nextval('public.gerente_id_seq'::regclass);


--
-- Name: meta id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta ALTER COLUMN id SET DEFAULT nextval('public.meta_id_seq'::regclass);


--
-- Name: oportunidade_nectar id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.oportunidade_nectar ALTER COLUMN id SET DEFAULT nextval('public.oportunidade_nectar_id_seq'::regclass);


--
-- Name: param_integracao id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.param_integracao ALTER COLUMN id SET DEFAULT nextval('public.param_integracao_id_seq'::regclass);


--
-- Name: periodo id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.periodo ALTER COLUMN id SET DEFAULT nextval('public.periodo_id_seq'::regclass);


--
-- Name: produto id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.produto ALTER COLUMN id SET DEFAULT nextval('public.produto_id_seq'::regclass);


--
-- Name: realizado id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.realizado ALTER COLUMN id SET DEFAULT nextval('public.realizado_id_seq'::regclass);


--
-- Name: unidade id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.unidade ALTER COLUMN id SET DEFAULT nextval('public.unidade_id_seq'::regclass);


--
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- Name: vendedor id; Type: DEFAULT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.vendedor ALTER COLUMN id SET DEFAULT nextval('public.vendedor_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.alembic_version (version_num) FROM stdin;
d5e6f7a8b9c0
\.


--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.empresa (id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Data for Name: gerente; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.gerente (id, unidade_id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Data for Name: meta; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.meta (id, vendedor_id, produto_id, periodo_id, valor, empresa_id, unidade_id, gerente_id, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Data for Name: oportunidade_nectar; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.oportunidade_nectar (id, param_integracao_id, id_oportunidade_ext, nome, cliente, valor, status_sincronizacao, data_sincronizacao, mensagem_erro, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Data for Name: param_integracao; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.param_integracao (id, tipo_integracao, token, endpoint_base, ativo, ultima_sincronizacao, status_ultimo_teste, mensagem_erro, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Data for Name: periodo; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.periodo (id, ano, mes, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Data for Name: produto; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.produto (id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
1	Setup	t	2026-07-21 01:04:44.812972+00	2026-07-21 01:04:44.812972+00	\N	\N
2	MRR	t	2026-07-21 01:04:44.812972+00	2026-07-21 01:04:44.812972+00	\N	\N
3	Projeto	t	2026-07-21 01:04:44.812972+00	2026-07-21 01:04:44.812972+00	\N	\N
4	NREC	t	2026-07-21 01:04:44.812972+00	2026-07-21 01:04:44.812972+00	\N	\N
5	REC	t	2026-07-21 01:04:44.812972+00	2026-07-21 01:04:44.812972+00	\N	\N
6	SCS	t	2026-07-21 01:04:44.812972+00	2026-07-21 01:04:44.812972+00	\N	\N
7	AMS	t	2026-07-21 01:04:44.812972+00	2026-07-21 01:04:44.812972+00	\N	\N
\.


--
-- Data for Name: realizado; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.realizado (id, vendedor_id, produto_id, data_venda, valor, origem, descricao, empresa_id, unidade_id, gerente_id, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Data for Name: unidade; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.unidade (id, empresa_id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.usuario (id, login, senha_hash, perfil, nome, gerente_id, vendedor_id, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
1	admin	$2b$12$h4HU2hnX3KWcvwp/JUHhbu7nc1AXQV63srHMQ9cd/u36PRH3KrqQu	admin	Admin	\N	\N	t	2026-07-21 01:05:15.563947+00	2026-07-21 01:05:15.563947+00	\N	\N
\.


--
-- Data for Name: vendedor; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.vendedor (id, gerente_id, nome, ref_externa, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
\.


--
-- Name: empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.empresa_id_seq', 1, false);


--
-- Name: gerente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.gerente_id_seq', 1, false);


--
-- Name: meta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.meta_id_seq', 1, false);


--
-- Name: oportunidade_nectar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.oportunidade_nectar_id_seq', 1, false);


--
-- Name: param_integracao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.param_integracao_id_seq', 1, false);


--
-- Name: periodo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.periodo_id_seq', 1, false);


--
-- Name: produto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.produto_id_seq', 7, true);


--
-- Name: realizado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.realizado_id_seq', 1, false);


--
-- Name: unidade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.unidade_id_seq', 1, false);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.usuario_id_seq', 1, true);


--
-- Name: vendedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.vendedor_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: empresa empresa_nome_key; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_nome_key UNIQUE (nome);


--
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id);


--
-- Name: gerente gerente_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.gerente
    ADD CONSTRAINT gerente_pkey PRIMARY KEY (id);


--
-- Name: meta meta_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta
    ADD CONSTRAINT meta_pkey PRIMARY KEY (id);


--
-- Name: oportunidade_nectar oportunidade_nectar_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.oportunidade_nectar
    ADD CONSTRAINT oportunidade_nectar_pkey PRIMARY KEY (id);


--
-- Name: param_integracao param_integracao_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.param_integracao
    ADD CONSTRAINT param_integracao_pkey PRIMARY KEY (id);


--
-- Name: periodo periodo_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.periodo
    ADD CONSTRAINT periodo_pkey PRIMARY KEY (id);


--
-- Name: produto produto_nome_key; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.produto
    ADD CONSTRAINT produto_nome_key UNIQUE (nome);


--
-- Name: produto produto_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.produto
    ADD CONSTRAINT produto_pkey PRIMARY KEY (id);


--
-- Name: realizado realizado_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT realizado_pkey PRIMARY KEY (id);


--
-- Name: unidade unidade_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.unidade
    ADD CONSTRAINT unidade_pkey PRIMARY KEY (id);


--
-- Name: gerente uq_gerente_unidade_nome; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.gerente
    ADD CONSTRAINT uq_gerente_unidade_nome UNIQUE (unidade_id, nome);


--
-- Name: meta uq_meta_vend_prod_per; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta
    ADD CONSTRAINT uq_meta_vend_prod_per UNIQUE (vendedor_id, produto_id, periodo_id);


--
-- Name: oportunidade_nectar uq_oportunidade_nectar; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.oportunidade_nectar
    ADD CONSTRAINT uq_oportunidade_nectar UNIQUE (param_integracao_id, id_oportunidade_ext);


--
-- Name: param_integracao uq_param_integracao_tipo; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.param_integracao
    ADD CONSTRAINT uq_param_integracao_tipo UNIQUE (tipo_integracao);


--
-- Name: periodo uq_periodo_ano_mes; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.periodo
    ADD CONSTRAINT uq_periodo_ano_mes UNIQUE (ano, mes);


--
-- Name: unidade uq_unidade_empresa_nome; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.unidade
    ADD CONSTRAINT uq_unidade_empresa_nome UNIQUE (empresa_id, nome);


--
-- Name: vendedor uq_vendedor_gerente_nome; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.vendedor
    ADD CONSTRAINT uq_vendedor_gerente_nome UNIQUE (gerente_id, nome);


--
-- Name: usuario usuario_login_key; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_login_key UNIQUE (login);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: vendedor vendedor_pkey; Type: CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.vendedor
    ADD CONSTRAINT vendedor_pkey PRIMARY KEY (id);


--
-- Name: ix_gerente_unidade; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_gerente_unidade ON public.gerente USING btree (unidade_id);


--
-- Name: ix_meta_periodo; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_meta_periodo ON public.meta USING btree (periodo_id);


--
-- Name: ix_meta_vendedor; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_meta_vendedor ON public.meta USING btree (vendedor_id);


--
-- Name: ix_oportunidade_nectar_param; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_oportunidade_nectar_param ON public.oportunidade_nectar USING btree (param_integracao_id);


--
-- Name: ix_oportunidade_nectar_status; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_oportunidade_nectar_status ON public.oportunidade_nectar USING btree (status_sincronizacao);


--
-- Name: ix_realizado_data; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_realizado_data ON public.realizado USING btree (data_venda);


--
-- Name: ix_realizado_produto; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_realizado_produto ON public.realizado USING btree (produto_id);


--
-- Name: ix_realizado_vendedor_data; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_realizado_vendedor_data ON public.realizado USING btree (vendedor_id, data_venda);


--
-- Name: ix_unidade_empresa; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_unidade_empresa ON public.unidade USING btree (empresa_id);


--
-- Name: ix_vendedor_gerente; Type: INDEX; Schema: public; Owner: metas_user
--

CREATE INDEX ix_vendedor_gerente ON public.vendedor USING btree (gerente_id);


--
-- Name: gerente gerente_unidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.gerente
    ADD CONSTRAINT gerente_unidade_id_fkey FOREIGN KEY (unidade_id) REFERENCES public.unidade(id);


--
-- Name: meta meta_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta
    ADD CONSTRAINT meta_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresa(id);


--
-- Name: meta meta_gerente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta
    ADD CONSTRAINT meta_gerente_id_fkey FOREIGN KEY (gerente_id) REFERENCES public.gerente(id);


--
-- Name: meta meta_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta
    ADD CONSTRAINT meta_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodo(id);


--
-- Name: meta meta_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta
    ADD CONSTRAINT meta_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produto(id);


--
-- Name: meta meta_unidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta
    ADD CONSTRAINT meta_unidade_id_fkey FOREIGN KEY (unidade_id) REFERENCES public.unidade(id);


--
-- Name: meta meta_vendedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.meta
    ADD CONSTRAINT meta_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.vendedor(id);


--
-- Name: oportunidade_nectar oportunidade_nectar_param_integracao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.oportunidade_nectar
    ADD CONSTRAINT oportunidade_nectar_param_integracao_id_fkey FOREIGN KEY (param_integracao_id) REFERENCES public.param_integracao(id);


--
-- Name: realizado realizado_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT realizado_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresa(id);


--
-- Name: realizado realizado_gerente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT realizado_gerente_id_fkey FOREIGN KEY (gerente_id) REFERENCES public.gerente(id);


--
-- Name: realizado realizado_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT realizado_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produto(id);


--
-- Name: realizado realizado_unidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT realizado_unidade_id_fkey FOREIGN KEY (unidade_id) REFERENCES public.unidade(id);


--
-- Name: realizado realizado_vendedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT realizado_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.vendedor(id);


--
-- Name: unidade unidade_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.unidade
    ADD CONSTRAINT unidade_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresa(id);


--
-- Name: usuario usuario_gerente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_gerente_id_fkey FOREIGN KEY (gerente_id) REFERENCES public.gerente(id);


--
-- Name: usuario usuario_vendedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.vendedor(id);


--
-- Name: vendedor vendedor_gerente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.vendedor
    ADD CONSTRAINT vendedor_gerente_id_fkey FOREIGN KEY (gerente_id) REFERENCES public.gerente(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 4e1TAtbPchA5v9aZLVFniQA8kslrX6OJLeZoFU4himQvR2DTSyt5YOBHCifZQQ1

