--
-- PostgreSQL database dump
--

\restrict lJtmqcP9fghQEKCnZXCcYQ84cpFkCvVDGusjJSY8iPsecuriBxapO5a6jSw5aEO

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
    periodo_id integer,
    numero_oportunidade character varying(10),
    numero_proposta character varying(10),
    codigo_cliente character varying(10),
    cnpj character varying(18),
    razao_social character varying(255),
    nome_fantasia character varying(255),
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
b2c3d4e5f6a7
\.


--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.empresa (id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
1	ASH	t	2026-07-19 21:32:33.406196+00	2026-07-20 11:32:59.629117+00	\N	\N
\.


--
-- Data for Name: gerente; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.gerente (id, unidade_id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
1	1	Hildebrando Batista	t	2026-07-19 21:32:33.413386+00	2026-07-20 11:33:31.309916+00	\N	\N
2	2	Hildebrando Batista	t	2026-07-20 14:06:47.304944+00	2026-07-20 14:06:47.304949+00	\N	\N
3	3	Hildebrando Batista	t	2026-07-20 14:06:51.303545+00	2026-07-20 14:06:51.303551+00	\N	\N
\.


--
-- Data for Name: meta; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.meta (id, vendedor_id, produto_id, periodo_id, valor, empresa_id, unidade_id, gerente_id, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
8	1	4	3	59606.24	1	1	1	t	2026-07-20 11:53:37.273531+00	2026-07-20 11:53:37.273538+00	\N	\N
9	1	5	3	6165.47	1	1	1	t	2026-07-20 11:53:37.27354+00	2026-07-20 11:53:37.27354+00	\N	\N
10	1	6	3	110648.48	1	1	1	t	2026-07-20 11:53:37.273542+00	2026-07-20 11:53:37.273542+00	\N	\N
11	1	7	3	2200.80	1	1	1	t	2026-07-20 11:53:37.273544+00	2026-07-20 11:53:37.273545+00	\N	\N
12	1	4	4	40354.48	1	1	1	t	2026-07-20 13:45:32.078126+00	2026-07-20 13:45:32.078134+00	\N	\N
13	1	5	4	7730.04	1	1	1	t	2026-07-20 13:45:32.078136+00	2026-07-20 13:45:32.078137+00	\N	\N
14	1	6	4	74906.85	1	1	1	t	2026-07-20 13:45:32.078138+00	2026-07-20 13:45:32.078139+00	\N	\N
15	1	7	4	2200.80	1	1	1	t	2026-07-20 13:45:32.07814+00	2026-07-20 13:45:32.078141+00	\N	\N
16	1	4	5	58276.92	1	1	1	t	2026-07-20 13:46:11.904814+00	2026-07-20 13:46:11.90482+00	\N	\N
17	1	5	5	11043.01	1	1	1	t	2026-07-20 13:46:11.904822+00	2026-07-20 13:46:11.904823+00	\N	\N
18	1	6	5	108174.86	1	1	1	t	2026-07-20 13:46:11.904824+00	2026-07-20 13:46:11.904825+00	\N	\N
19	1	7	5	2200.80	1	1	1	t	2026-07-20 13:46:11.904826+00	2026-07-20 13:46:11.904827+00	\N	\N
20	2	4	3	48768.45	1	1	1	t	2026-07-20 14:05:29.444115+00	2026-07-20 14:05:29.444121+00	\N	\N
21	2	5	3	5044.47	1	1	1	t	2026-07-20 14:05:29.444123+00	2026-07-20 14:05:29.444124+00	\N	\N
22	2	6	3	90525.58	1	1	1	t	2026-07-20 14:05:29.444124+00	2026-07-20 14:05:29.444125+00	\N	\N
23	2	7	3	2721.60	1	1	1	t	2026-07-20 14:05:29.444126+00	2026-07-20 14:05:29.444126+00	\N	\N
25	4	6	4	300000.00	1	3	3	t	2026-07-20 14:08:12.97308+00	2026-07-20 14:08:12.973087+00	\N	\N
26	4	6	5	300000.00	1	3	3	t	2026-07-20 14:08:20.775519+00	2026-07-20 14:08:20.775525+00	\N	\N
24	4	6	3	300000.00	1	3	3	t	2026-07-20 14:07:53.985448+00	2026-07-20 14:09:28.481581+00	\N	\N
\.


--
-- Data for Name: periodo; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.periodo (id, ano, mes, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
2	2026	4	2026-07-19 21:34:09.649688+00	2026-07-19 21:34:09.649695+00	\N	\N
3	2026	1	2026-07-19 21:35:28.116925+00	2026-07-19 21:35:28.11693+00	\N	\N
4	2026	2	2026-07-20 13:45:32.061718+00	2026-07-20 13:45:32.061725+00	\N	\N
5	2026	3	2026-07-20 13:46:11.892089+00	2026-07-20 13:46:11.892096+00	\N	\N
\.


--
-- Data for Name: produto; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.produto (id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
7	AMS	t	2026-07-19 21:22:19.956667+00	2026-07-19 21:22:19.956667+00	\N	\N
1	Setup	f	2026-07-19 21:22:19.956667+00	2026-07-20 11:34:00.24358+00	\N	\N
2	MRR	f	2026-07-19 21:22:19.956667+00	2026-07-20 11:34:03.364548+00	\N	\N
3	Projeto	f	2026-07-19 21:22:19.956667+00	2026-07-20 11:34:04.917596+00	\N	\N
4	NREC (CDU/ADESÃO)	t	2026-07-19 21:22:19.956667+00	2026-07-20 11:34:16.500517+00	\N	\N
5	REC (SMS/SAAS/CLOUD)	t	2026-07-19 21:22:19.956667+00	2026-07-20 11:34:24.804073+00	\N	\N
6	SCS (PRJ/BH/AMS)	t	2026-07-19 21:22:19.956667+00	2026-07-20 11:34:34.621591+00	\N	\N
\.


--
-- Data for Name: realizado; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.realizado (id, vendedor_id, produto_id, data_venda, valor, origem, descricao, empresa_id, unidade_id, gerente_id, ativo, criado_em, atualizado_em, criado_por, atualizado_por, periodo_id, numero_oportunidade, numero_proposta, codigo_cliente, cnpj, razao_social, nome_fantasia) FROM stdin;
3	1	4	2026-01-31	50000.00	manual	TESTE VALIDACAO FIX	1	1	1	f	2026-07-20 12:07:34.168414+00	2026-07-20 12:07:34.168419+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
5	1	4	2026-07-21	100000.00	manual	TEST - Strings vazias	1	1	1	f	2026-07-20 12:17:53.238867+00	2026-07-20 12:17:53.238872+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
8	1	4	2026-07-20	1500.50	manual	Teste de lançamento	1	1	1	f	2026-07-20 12:32:33.656822+00	2026-07-20 12:32:33.916514+00	\N	\N	\N	OPP-001	PRO-001	CLI-001	11.222.333/0001-81	Empresa Teste LTDA	Empresa Teste
10	1	4	2026-07-20	9999.99	manual	EDITADO!	1	1	1	f	2026-07-20 12:34:28.13513+00	2026-07-20 12:34:28.359023+00	\N	\N	\N	OPP-999	PRO-999	CLI-999	11.222.333/0001-81	Empresa	Empresa
4	1	4	2026-07-20	75000.00	manual	NOVO FORMULÁRIO - 5 SEÇÕES	1	1	1	f	2026-07-20 12:17:34.965408+00	2026-07-20 13:42:33.055119+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
7	1	4	2026-07-20	99999.99	manual	✨ TESTE COMPLETO - NOVO FORM 5 SEÇÕES	1	1	1	f	2026-07-20 12:23:06.448477+00	2026-07-20 13:42:35.501291+00	\N	\N	\N	OPP-FINAL	PROP-FINAL	CLI-FINAL	99.999.999/9999-99	Empresa Final LTDA	Empresa Final
9	1	4	2026-07-20	1500.50	manual	Teste edição	1	1	1	f	2026-07-20 12:32:45.499878+00	2026-07-20 13:42:39.454323+00	\N	\N	\N	OPP-001	PRO-001	CLI-001	11.222.333/0001-81	Empresa Teste LTDA	Empresa Teste
6	1	4	2026-01-31	1000.00	manual	Teste	1	1	1	f	2026-07-20 12:21:26.463983+00	2026-07-20 13:47:54.734232+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
11	1	4	2026-01-31	10086.40	manual	RH PROTHEUS - FRIG. VALENCIO	1	1	1	t	2026-07-20 13:57:50.400526+00	2026-07-20 13:57:50.400532+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
12	1	4	2026-01-31	5739.50	manual	CDU - ALVORADA MANGUEIRAS	1	1	1	t	2026-07-20 13:58:19.591064+00	2026-07-20 13:58:19.59107+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
13	1	4	2026-01-31	48985.27	manual	ERP WT - SOL MAT. DE CONSTRUÇÃO	1	1	1	t	2026-07-20 13:58:51.357928+00	2026-07-20 13:58:51.357934+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
14	1	6	2026-01-31	89950.00	manual	RH PROTHEUS - FRIG. VALENCIO	1	1	1	t	2026-07-20 14:02:01.038439+00	2026-07-20 14:02:01.038446+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
15	1	6	2026-01-31	79546.58	manual	WT - SOL MAT. CONSTRUCAO	1	1	1	t	2026-07-20 14:02:51.352924+00	2026-07-20 14:02:51.352931+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: unidade; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.unidade (id, empresa_id, nome, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
1	1	TCKS	t	2026-07-19 21:32:33.408964+00	2026-07-20 11:33:10.397726+00	\N	\N
2	1	TBC	t	2026-07-20 14:06:25.413903+00	2026-07-20 14:06:25.413907+00	\N	\N
3	1	ASH	t	2026-07-20 14:06:28.871902+00	2026-07-20 14:06:28.871907+00	\N	\N
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.usuario (id, login, senha_hash, perfil, nome, gerente_id, vendedor_id, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
3	Admin	$2b$12$wl.ftbBCH2JvC2OGGBffJ.f9xJ5JWXkBSmCL/kY27CANdH0AoTPT.	admin	Administrador	\N	\N	t	2026-07-19 21:31:42.512695+00	2026-07-19 21:31:42.512695+00	\N	\N
4	walison.ferreira@ashbrasil.com	$2b$12$PuBorRBAd48Fxhhbx1UmSOZm9TafS9lptbMx5gfS4a3G9Qt6vfF1m	vendedor	Walison Ferreira	\N	1	t	2026-07-20 11:37:22.779942+00	2026-07-20 11:37:22.779949+00	\N	\N
\.


--
-- Data for Name: vendedor; Type: TABLE DATA; Schema: public; Owner: metas_user
--

COPY public.vendedor (id, gerente_id, nome, ref_externa, ativo, criado_em, atualizado_em, criado_por, atualizado_por) FROM stdin;
1	1	Walison Ferreira	\N	t	2026-07-19 21:33:25.473287+00	2026-07-20 11:33:48.576834+00	\N	\N
2	1	Klandson Freitas	\N	t	2026-07-20 13:43:53.152973+00	2026-07-20 13:43:53.152981+00	\N	\N
3	2	Fábio Brandão	\N	t	2026-07-20 14:07:09.535517+00	2026-07-20 14:07:09.535525+00	\N	\N
4	3	Hildebrando Batista	\N	t	2026-07-20 14:07:18.576474+00	2026-07-20 14:07:18.57648+00	\N	\N
5	3	Fábio Brandão	\N	t	2026-07-20 14:07:25.574955+00	2026-07-20 14:07:25.57496+00	\N	\N
\.


--
-- Name: empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.empresa_id_seq', 1, true);


--
-- Name: gerente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.gerente_id_seq', 3, true);


--
-- Name: meta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.meta_id_seq', 26, true);


--
-- Name: periodo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.periodo_id_seq', 5, true);


--
-- Name: produto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.produto_id_seq', 7, true);


--
-- Name: realizado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.realizado_id_seq', 15, true);


--
-- Name: unidade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.unidade_id_seq', 3, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.usuario_id_seq', 4, true);


--
-- Name: vendedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.vendedor_id_seq', 5, true);


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
-- Name: realizado realizado_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metas_user
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT realizado_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodo(id);


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

\unrestrict lJtmqcP9fghQEKCnZXCcYQ84cpFkCvVDGusjJSY8iPsecuriBxapO5a6jSw5aEO

