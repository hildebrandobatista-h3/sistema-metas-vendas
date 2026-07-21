--
-- PostgreSQL database dump
--

\restrict yfyb4D4M7rzVNZVdAnbpvQwNmk9WUl3Xa7GWcgShQMOK7CiEfavJXjmJrcPSKbf

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
b2c3d4e5f6a7
\.


--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.empresa (id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
3	ASH	t	2026-07-21 00:07:55.681336+00	2026-07-21 00:07:55.681344+00	\N	\N
\.


--
-- Data for Name: gerente; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.gerente (id, unidade_id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
4	4	Hildebrando Batista	t	2026-07-21 00:08:26.482732+00	2026-07-21 00:08:31.186491+00	\N	\N
5	5	Hildebrando Batista	t	2026-07-21 00:08:38.542016+00	2026-07-21 00:08:38.542021+00	\N	\N
6	6	Hildebrando Batista	t	2026-07-21 00:08:41.633296+00	2026-07-21 00:08:41.633303+00	\N	\N
\.


--
-- Data for Name: meta; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.meta (id, vendedor_id, produto_id, periodo_id, valor, empresa_id, unidade_id, gerente_id, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
27	6	10	6	300000.00	3	6	6	t	2026-07-21 00:10:46.083134+00	2026-07-21 00:10:46.083139+00	\N	\N
28	6	10	7	300000.00	3	6	6	t	2026-07-21 00:10:50.270546+00	2026-07-21 00:10:50.270552+00	\N	\N
29	6	10	8	300000.00	3	6	6	t	2026-07-21 00:10:54.421507+00	2026-07-21 00:10:54.421512+00	\N	\N
30	6	10	9	150000.00	3	6	6	t	2026-07-21 00:11:06.658445+00	2026-07-21 00:11:06.65845+00	\N	\N
31	6	10	10	150000.00	3	6	6	t	2026-07-21 00:11:12.215356+00	2026-07-21 00:11:12.215361+00	\N	\N
32	6	10	11	150000.00	3	6	6	t	2026-07-21 00:11:15.925078+00	2026-07-21 00:11:15.925084+00	\N	\N
33	6	10	12	150000.00	3	6	6	t	2026-07-21 00:11:20.11805+00	2026-07-21 00:11:20.118058+00	\N	\N
34	6	10	13	150000.00	3	6	6	t	2026-07-21 00:11:23.893253+00	2026-07-21 00:11:23.893258+00	\N	\N
35	6	10	14	150000.00	3	6	6	t	2026-07-21 00:11:30.024925+00	2026-07-21 00:11:30.02493+00	\N	\N
36	6	10	15	150000.00	3	6	6	t	2026-07-21 00:11:36.762726+00	2026-07-21 00:11:36.762731+00	\N	\N
37	6	10	16	150000.00	3	6	6	t	2026-07-21 00:11:42.013104+00	2026-07-21 00:11:42.013109+00	\N	\N
38	7	10	10	175000.00	3	6	6	t	2026-07-21 00:12:54.211779+00	2026-07-21 00:12:54.211786+00	\N	\N
39	7	10	11	175000.00	3	6	6	t	2026-07-21 00:12:58.46224+00	2026-07-21 00:12:58.462245+00	\N	\N
40	7	10	17	175000.00	3	6	6	t	2026-07-21 00:13:02.095366+00	2026-07-21 00:13:02.095375+00	\N	\N
41	7	10	12	175000.00	3	6	6	t	2026-07-21 00:13:09.198178+00	2026-07-21 00:13:09.198185+00	\N	\N
42	7	10	13	175000.00	3	6	6	t	2026-07-21 00:13:12.816632+00	2026-07-21 00:13:12.816636+00	\N	\N
43	7	10	14	175000.00	3	6	6	t	2026-07-21 00:13:16.79664+00	2026-07-21 00:13:16.796646+00	\N	\N
44	7	10	15	175000.00	3	6	6	t	2026-07-21 00:13:20.603943+00	2026-07-21 00:13:20.60395+00	\N	\N
45	7	10	16	175000.00	3	6	6	t	2026-07-21 00:13:24.582159+00	2026-07-21 00:13:24.582164+00	\N	\N
46	6	10	17	150000.00	3	6	6	t	2026-07-21 00:15:30.133853+00	2026-07-21 00:15:30.133861+00	\N	\N
47	7	11	10	5760.00	3	6	6	t	2026-07-21 00:17:01.199195+00	2026-07-21 00:17:01.199202+00	\N	\N
48	7	11	11	5760.00	3	6	6	t	2026-07-21 00:17:05.38209+00	2026-07-21 00:17:05.382098+00	\N	\N
52	7	11	14	4560.00	3	6	6	t	2026-07-21 00:17:24.646857+00	2026-07-21 00:19:17.25119+00	\N	\N
53	7	11	15	4560.00	3	6	6	t	2026-07-21 00:17:28.65791+00	2026-07-21 00:19:22.557609+00	\N	\N
54	7	11	16	4560.00	3	6	6	t	2026-07-21 00:17:32.647216+00	2026-07-21 00:19:27.81809+00	\N	\N
49	7	11	17	5560.00	3	6	6	t	2026-07-21 00:17:11.932327+00	2026-07-21 00:20:36.206279+00	\N	\N
50	7	11	12	5560.00	3	6	6	t	2026-07-21 00:17:16.061632+00	2026-07-21 00:20:41.156773+00	\N	\N
51	7	11	13	5560.00	3	6	6	t	2026-07-21 00:17:20.843647+00	2026-07-21 00:20:46.784035+00	\N	\N
55	8	8	6	59606.24	3	4	4	t	2026-07-21 00:21:52.43628+00	2026-07-21 00:21:52.436286+00	\N	\N
56	8	9	6	6165.47	3	4	4	t	2026-07-21 00:21:52.436288+00	2026-07-21 00:21:52.436289+00	\N	\N
57	8	10	6	110642.38	3	4	4	t	2026-07-21 00:21:52.43629+00	2026-07-21 00:21:52.436291+00	\N	\N
58	8	11	6	2200.80	3	4	4	t	2026-07-21 00:21:52.436292+00	2026-07-21 00:21:52.436293+00	\N	\N
59	8	11	7	2200.80	3	4	4	t	2026-07-21 00:21:56.995129+00	2026-07-21 00:21:56.995134+00	\N	\N
60	8	11	8	2200.80	3	4	4	t	2026-07-21 00:22:01.105501+00	2026-07-21 00:22:01.105509+00	\N	\N
61	8	8	7	40354.48	3	4	4	t	2026-07-21 00:22:09.959988+00	2026-07-21 00:22:09.959994+00	\N	\N
62	8	9	7	7730.04	3	4	4	t	2026-07-21 00:22:19.659177+00	2026-07-21 00:22:19.659184+00	\N	\N
63	8	10	7	74906.85	3	4	4	t	2026-07-21 00:22:19.659185+00	2026-07-21 00:22:19.659186+00	\N	\N
64	8	8	8	58276.92	3	4	4	t	2026-07-21 00:22:36.379089+00	2026-07-21 00:22:36.379097+00	\N	\N
65	8	9	8	11043.01	3	4	4	t	2026-07-21 00:22:36.379099+00	2026-07-21 00:22:36.3791+00	\N	\N
66	8	10	8	108174.86	3	4	4	t	2026-07-21 00:22:36.379101+00	2026-07-21 00:22:36.379102+00	\N	\N
67	8	8	9	30410.14	3	4	4	t	2026-07-21 00:22:59.051123+00	2026-07-21 00:22:59.051129+00	\N	\N
68	8	9	9	9307.46	3	4	4	t	2026-07-21 00:22:59.051131+00	2026-07-21 00:22:59.051131+00	\N	\N
69	8	10	9	56447.96	3	4	4	t	2026-07-21 00:22:59.051132+00	2026-07-21 00:22:59.051132+00	\N	\N
70	8	11	9	2200.80	3	4	4	t	2026-07-21 00:22:59.051133+00	2026-07-21 00:22:59.051134+00	\N	\N
71	8	11	10	2200.80	3	4	4	t	2026-07-21 00:23:03.226382+00	2026-07-21 00:23:03.226388+00	\N	\N
72	8	11	11	2200.80	3	4	4	t	2026-07-21 00:23:07.041914+00	2026-07-21 00:23:07.04192+00	\N	\N
79	8	11	17	2200.80	3	4	4	t	2026-07-21 00:23:40.991879+00	2026-07-21 00:23:40.99188+00	\N	\N
80	8	11	12	2200.80	3	4	4	t	2026-07-21 00:23:50.508038+00	2026-07-21 00:23:50.508043+00	\N	\N
81	8	11	13	2200.80	3	4	4	t	2026-07-21 00:23:55.195552+00	2026-07-21 00:23:55.195588+00	\N	\N
82	8	11	14	2200.80	3	4	4	t	2026-07-21 00:23:58.649735+00	2026-07-21 00:23:58.649741+00	\N	\N
83	8	11	15	2200.80	3	4	4	t	2026-07-21 00:24:02.109142+00	2026-07-21 00:24:02.109153+00	\N	\N
84	8	11	16	2200.80	3	4	4	t	2026-07-21 00:24:05.851771+00	2026-07-21 00:24:05.851779+00	\N	\N
85	8	8	10	39082.08	3	4	4	t	2026-07-21 00:25:29.573007+00	2026-07-21 00:25:29.573015+00	\N	\N
86	8	9	10	10266.98	3	4	4	t	2026-07-21 00:25:29.573017+00	2026-07-21 00:25:29.573017+00	\N	\N
87	8	10	10	72544.99	3	4	4	t	2026-07-21 00:25:29.573018+00	2026-07-21 00:25:29.573019+00	\N	\N
73	8	8	11	48101.30	3	4	4	t	2026-07-21 00:23:21.588947+00	2026-07-21 00:25:51.417017+00	\N	\N
74	8	9	11	12304.52	3	4	4	t	2026-07-21 00:23:21.588954+00	2026-07-21 00:25:51.417023+00	\N	\N
75	8	10	11	89286.66	3	4	4	t	2026-07-21 00:23:21.588956+00	2026-07-21 00:25:51.417023+00	\N	\N
76	8	8	17	32606.95	3	4	4	t	2026-07-21 00:23:40.991864+00	2026-07-21 00:26:13.741106+00	\N	\N
77	8	9	17	7112.14	3	4	4	t	2026-07-21 00:23:40.991874+00	2026-07-21 00:26:13.741113+00	\N	\N
78	8	10	17	60525.71	3	4	4	t	2026-07-21 00:23:40.991877+00	2026-07-21 00:26:13.741114+00	\N	\N
88	8	8	12	42782.57	3	4	4	t	2026-07-21 00:26:32.325547+00	2026-07-21 00:26:32.325554+00	\N	\N
89	8	9	12	11594.52	3	4	4	t	2026-07-21 00:26:32.325555+00	2026-07-21 00:26:32.325556+00	\N	\N
90	8	10	12	79413.92	3	4	4	t	2026-07-21 00:26:32.325556+00	2026-07-21 00:26:32.325557+00	\N	\N
91	8	8	13	69434.59	3	4	4	t	2026-07-21 00:26:50.007514+00	2026-07-21 00:26:50.00752+00	\N	\N
92	8	9	13	19430.22	3	4	4	t	2026-07-21 00:26:50.007521+00	2026-07-21 00:26:50.007522+00	\N	\N
93	8	10	13	128885.96	3	4	4	t	2026-07-21 00:26:50.007522+00	2026-07-21 00:26:50.007523+00	\N	\N
94	8	8	14	54923.72	3	4	4	t	2026-07-21 00:27:11.468005+00	2026-07-21 00:27:11.46801+00	\N	\N
95	8	9	14	10608.95	3	4	4	t	2026-07-21 00:27:11.468012+00	2026-07-21 00:27:11.468012+00	\N	\N
96	8	10	14	101950.57	3	4	4	t	2026-07-21 00:27:11.468013+00	2026-07-21 00:27:11.468013+00	\N	\N
97	8	8	15	51570.51	3	4	4	t	2026-07-21 00:27:29.93206+00	2026-07-21 00:27:29.932067+00	\N	\N
98	8	9	15	12370.56	3	4	4	t	2026-07-21 00:27:29.932068+00	2026-07-21 00:27:29.932069+00	\N	\N
99	8	10	15	95726.28	3	4	4	t	2026-07-21 00:27:29.93207+00	2026-07-21 00:27:29.93207+00	\N	\N
100	8	8	16	51049.59	3	4	4	t	2026-07-21 00:27:51.982967+00	2026-07-21 00:27:51.982974+00	\N	\N
101	8	9	16	13527.48	3	4	4	t	2026-07-21 00:27:51.982976+00	2026-07-21 00:27:51.982977+00	\N	\N
102	8	10	16	94759.33	3	4	4	t	2026-07-21 00:27:51.982978+00	2026-07-21 00:27:51.982979+00	\N	\N
103	9	8	6	48768.75	3	4	4	t	2026-07-21 00:28:59.192833+00	2026-07-21 00:28:59.192839+00	\N	\N
104	9	9	6	5044.47	3	4	4	t	2026-07-21 00:28:59.192841+00	2026-07-21 00:28:59.192842+00	\N	\N
105	9	10	6	90525.58	3	4	4	t	2026-07-21 00:28:59.192843+00	2026-07-21 00:28:59.192843+00	\N	\N
106	9	11	6	2721.60	3	4	4	t	2026-07-21 00:28:59.192844+00	2026-07-21 00:28:59.192845+00	\N	\N
107	9	11	7	2721.60	3	4	4	t	2026-07-21 00:29:05.117691+00	2026-07-21 00:29:05.117699+00	\N	\N
108	9	11	8	2721.60	3	4	4	t	2026-07-21 00:29:08.960494+00	2026-07-21 00:29:08.960501+00	\N	\N
109	9	8	7	33017.31	3	4	4	t	2026-07-21 00:29:23.014598+00	2026-07-21 00:29:23.014613+00	\N	\N
110	9	9	7	6324.58	3	4	4	t	2026-07-21 00:29:23.014614+00	2026-07-21 00:29:23.014615+00	\N	\N
111	9	10	7	61287.43	3	4	4	t	2026-07-21 00:29:23.014616+00	2026-07-21 00:29:23.014616+00	\N	\N
112	9	8	8	47681.12	3	4	4	t	2026-07-21 00:29:40.045966+00	2026-07-21 00:29:40.045974+00	\N	\N
113	9	9	8	9035.19	3	4	4	t	2026-07-21 00:29:40.045977+00	2026-07-21 00:29:40.045978+00	\N	\N
114	9	10	8	88506.71	3	4	4	t	2026-07-21 00:29:40.045979+00	2026-07-21 00:29:40.04598+00	\N	\N
115	9	8	9	24881.03	3	4	4	t	2026-07-21 00:30:09.773161+00	2026-07-21 00:30:09.773169+00	\N	\N
116	9	9	9	7615.19	3	4	4	t	2026-07-21 00:30:09.773172+00	2026-07-21 00:30:09.773173+00	\N	\N
117	9	10	9	46184.69	3	4	4	t	2026-07-21 00:30:09.773174+00	2026-07-21 00:30:09.773175+00	\N	\N
118	9	11	9	2721.60	3	4	4	t	2026-07-21 00:30:09.773176+00	2026-07-21 00:30:09.773177+00	\N	\N
119	9	11	10	2721.60	3	4	4	t	2026-07-21 00:30:14.216751+00	2026-07-21 00:30:14.216758+00	\N	\N
120	9	11	11	2721.60	3	4	4	t	2026-07-21 00:30:17.992046+00	2026-07-21 00:30:17.992055+00	\N	\N
127	9	8	17	26678.41	3	4	4	t	2026-07-21 00:31:20.833787+00	2026-07-21 00:31:20.833793+00	\N	\N
128	9	9	17	5819.02	3	4	4	t	2026-07-21 00:31:20.833795+00	2026-07-21 00:31:20.833796+00	\N	\N
129	9	10	17	49521.04	3	4	4	t	2026-07-21 00:31:20.833797+00	2026-07-21 00:31:20.833797+00	\N	\N
130	9	11	17	2721.60	3	4	4	t	2026-07-21 00:31:20.833798+00	2026-07-21 00:31:20.833799+00	\N	\N
121	9	8	10	31976.25	3	4	4	t	2026-07-21 00:30:46.032461+00	2026-07-21 00:30:46.032468+00	\N	\N
122	9	9	10	8400.25	3	4	4	t	2026-07-21 00:30:46.032469+00	2026-07-21 00:30:46.03247+00	\N	\N
123	9	10	10	59354.99	3	4	4	t	2026-07-21 00:30:46.032471+00	2026-07-21 00:30:46.032471+00	\N	\N
124	9	8	11	39355.61	3	4	4	t	2026-07-21 00:31:01.642833+00	2026-07-21 00:31:01.642842+00	\N	\N
125	9	9	11	10067.34	3	4	4	t	2026-07-21 00:31:01.642844+00	2026-07-21 00:31:01.642845+00	\N	\N
126	9	10	11	73052.72	3	4	4	t	2026-07-21 00:31:01.642846+00	2026-07-21 00:31:01.642847+00	\N	\N
131	9	11	12	2721.60	3	4	4	t	2026-07-21 00:31:25.425114+00	2026-07-21 00:31:25.425121+00	\N	\N
132	9	11	13	2721.60	3	4	4	t	2026-07-21 00:31:30.934632+00	2026-07-21 00:31:30.934637+00	\N	\N
133	9	8	12	35003.92	3	4	4	t	2026-07-21 00:31:55.633386+00	2026-07-21 00:31:55.633391+00	\N	\N
134	9	9	12	9486.43	3	4	4	t	2026-07-21 00:31:55.633392+00	2026-07-21 00:31:55.633393+00	\N	\N
135	9	10	12	64975.02	3	4	4	t	2026-07-21 00:31:55.633394+00	2026-07-21 00:31:55.633394+00	\N	\N
136	9	8	13	56810.12	3	4	4	t	2026-07-21 00:32:10.961998+00	2026-07-21 00:32:10.962005+00	\N	\N
137	9	9	13	15897.46	3	4	4	t	2026-07-21 00:32:10.962007+00	2026-07-21 00:32:10.962008+00	\N	\N
138	9	10	13	105452.15	3	4	4	t	2026-07-21 00:32:10.962009+00	2026-07-21 00:32:10.962009+00	\N	\N
139	9	8	14	44937.59	3	4	4	t	2026-07-21 00:32:31.863003+00	2026-07-21 00:32:31.863008+00	\N	\N
140	9	9	14	8680.05	3	4	4	t	2026-07-21 00:32:31.86301+00	2026-07-21 00:32:31.863011+00	\N	\N
141	9	10	14	83414.10	3	4	4	t	2026-07-21 00:32:31.863011+00	2026-07-21 00:32:31.863012+00	\N	\N
142	9	11	14	2721.60	3	4	4	t	2026-07-21 00:32:31.863012+00	2026-07-21 00:32:31.863013+00	\N	\N
143	9	11	15	2721.60	3	4	4	t	2026-07-21 00:32:36.542917+00	2026-07-21 00:32:36.542922+00	\N	\N
144	9	11	16	2721.60	3	4	4	t	2026-07-21 00:32:40.244178+00	2026-07-21 00:32:40.244184+00	\N	\N
145	9	8	15	42194.05	3	4	4	t	2026-07-21 00:32:58.443358+00	2026-07-21 00:32:58.443364+00	\N	\N
146	9	9	15	10121.37	3	4	4	t	2026-07-21 00:32:58.443367+00	2026-07-21 00:32:58.443369+00	\N	\N
147	9	10	15	78321.50	3	4	4	t	2026-07-21 00:32:58.443371+00	2026-07-21 00:32:58.443373+00	\N	\N
148	9	8	16	41767.84	3	4	4	t	2026-07-21 00:33:10.221444+00	2026-07-21 00:33:10.221452+00	\N	\N
149	9	9	16	11067.94	3	4	4	t	2026-07-21 00:33:10.221454+00	2026-07-21 00:33:10.221455+00	\N	\N
150	9	10	16	77530.36	3	4	4	t	2026-07-21 00:33:10.221456+00	2026-07-21 00:33:10.221457+00	\N	\N
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
6	2026	1	2026-07-21 00:10:46.075966+00	2026-07-21 00:10:46.075972+00	\N	\N
7	2026	2	2026-07-21 00:10:50.267336+00	2026-07-21 00:10:50.267343+00	\N	\N
8	2026	3	2026-07-21 00:10:54.418226+00	2026-07-21 00:10:54.418232+00	\N	\N
9	2026	4	2026-07-21 00:11:06.655869+00	2026-07-21 00:11:06.655873+00	\N	\N
10	2026	5	2026-07-21 00:11:12.211037+00	2026-07-21 00:11:12.211044+00	\N	\N
11	2026	6	2026-07-21 00:11:15.917299+00	2026-07-21 00:11:15.917306+00	\N	\N
12	2026	8	2026-07-21 00:11:20.111117+00	2026-07-21 00:11:20.111123+00	\N	\N
13	2026	9	2026-07-21 00:11:23.890276+00	2026-07-21 00:11:23.890285+00	\N	\N
14	2026	10	2026-07-21 00:11:30.020945+00	2026-07-21 00:11:30.020952+00	\N	\N
15	2026	11	2026-07-21 00:11:36.760131+00	2026-07-21 00:11:36.760137+00	\N	\N
16	2026	12	2026-07-21 00:11:42.00997+00	2026-07-21 00:11:42.009976+00	\N	\N
17	2026	7	2026-07-21 00:13:02.074942+00	2026-07-21 00:13:02.074961+00	\N	\N
\.


--
-- Data for Name: produto; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.produto (id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
8	NREC (CDU/ADESÃO)	t	2026-07-21 00:09:18.183746+00	2026-07-21 00:09:18.183753+00	\N	\N
9	REC (SMS/SAAS/CLOUD)	t	2026-07-21 00:09:27.775881+00	2026-07-21 00:09:27.775887+00	\N	\N
10	SCS (PRJ/BH/FSW)	t	2026-07-21 00:09:39.016613+00	2026-07-21 00:09:39.016618+00	\N	\N
11	AMS (SUP/SUS)	t	2026-07-21 00:09:49.626751+00	2026-07-21 00:09:49.626756+00	\N	\N
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
4	3	TCKS	t	2026-07-21 00:08:03.567896+00	2026-07-21 00:08:03.567904+00	\N	\N
5	3	TBC	t	2026-07-21 00:08:07.020853+00	2026-07-21 00:08:07.020861+00	\N	\N
6	3	ASH	t	2026-07-21 00:08:10.330267+00	2026-07-21 00:08:10.330275+00	\N	\N
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.usuario (id, login, senha_hash, perfil, nome, gerente_id, vendedor_id, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
7	admin	$2b$12$aRB5fM8DQ4aGD6kqJeQA3usweTHxFs9RWpCPoKWAe1tniBvycs.Im	admin	Admin	\N	\N	t	2026-07-21 00:05:20.040479+00	2026-07-21 00:05:20.040479+00	\N	\N
\.


--
-- Data for Name: vendedor; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.vendedor (id, gerente_id, nome, ref_externa, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
6	6	Hildebrando Batista	\N	t	2026-07-21 00:08:50.243655+00	2026-07-21 00:08:50.243661+00	\N	\N
7	6	Fábio Brandão	\N	t	2026-07-21 00:08:55.371459+00	2026-07-21 00:08:55.371466+00	\N	\N
8	4	Walison Ferreira	\N	t	2026-07-21 00:10:08.513544+00	2026-07-21 00:10:08.513552+00	\N	\N
9	4	Klandson Freitas	\N	t	2026-07-21 00:10:12.925892+00	2026-07-21 00:10:12.925899+00	\N	\N
10	5	Hildebrando Batista	\N	t	2026-07-21 00:10:17.749306+00	2026-07-21 00:10:17.749311+00	\N	\N
11	5	Fábio Ferreira	\N	t	2026-07-21 00:10:25.367514+00	2026-07-21 00:10:25.36752+00	\N	\N
\.


--
-- Name: empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.empresa_id_seq', 3, true);


--
-- Name: gerente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.gerente_id_seq', 6, true);


--
-- Name: meta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.meta_id_seq', 150, true);


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

SELECT pg_catalog.setval('public.periodo_id_seq', 17, true);


--
-- Name: produto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.produto_id_seq', 11, true);


--
-- Name: realizado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.realizado_id_seq', 15, true);


--
-- Name: unidade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.unidade_id_seq', 6, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.usuario_id_seq', 7, true);


--
-- Name: vendedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.vendedor_id_seq', 11, true);


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

\unrestrict yfyb4D4M7rzVNZVdAnbpvQwNmk9WUl3Xa7GWcgShQMOK7CiEfavJXjmJrcPSKbf

