--
-- PostgreSQL database dump
--

\restrict lOMYJsBc54dnLOn2BVdxg8lCIeJXdyyyF0YX96dcZxiTgAWIpEmSsXWnLLcRZnl

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
    CONSTRAINT ck_realizado_origem CHECK (((origem)::text = ANY (ARRAY[('manual'::character varying)::text, ('nectar'::character varying)::text]))),
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
    CONSTRAINT ck_usuario_perfil CHECK (((perfil)::text = ANY (ARRAY[('admin'::character varying)::text, ('gerente'::character varying)::text, ('vendedor'::character varying)::text])))
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
151	12	10	7	175000.00	3	6	6	t	2026-07-21 02:02:05.016317+00	2026-07-21 02:02:05.016326+00	\N	\N
152	12	11	7	4760.00	3	6	6	t	2026-07-21 02:02:05.016328+00	2026-07-21 02:02:05.016329+00	\N	\N
153	12	11	8	4760.00	3	6	6	t	2026-07-21 02:02:09.995045+00	2026-07-21 02:02:09.995052+00	\N	\N
154	12	11	9	5760.00	3	6	6	t	2026-07-21 02:02:22.783072+00	2026-07-21 02:02:22.783077+00	\N	\N
155	12	10	9	175000.00	3	6	6	t	2026-07-21 02:02:29.945055+00	2026-07-21 02:02:29.945061+00	\N	\N
156	12	10	8	175000.00	3	6	6	t	2026-07-21 02:02:34.992146+00	2026-07-21 02:02:34.992152+00	\N	\N
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
18	6	10	2026-01-28	537783.42	manual	TOTVS RS -  ERP PT - TECBRIL	3	6	6	t	2026-07-21 01:31:16.246144+00	2026-07-21 01:31:16.24615+00	\N	\N
19	6	10	2026-01-28	77105.94	manual	RZK - ANALISTA RESIDENTE	3	6	6	t	2026-07-21 01:31:43.504086+00	2026-07-21 01:31:43.504094+00	\N	\N
20	6	10	2026-01-28	86748.72	manual	RZK - ANALISTA RESIDENTE	3	6	6	t	2026-07-21 01:32:16.639181+00	2026-07-21 01:32:16.639188+00	\N	\N
21	6	10	2026-01-28	23614.93	manual	RFP - HP - FAZENDAS	3	6	6	t	2026-07-21 01:32:41.208422+00	2026-07-21 01:32:41.208428+00	\N	\N
22	6	10	2026-01-31	180000.00	manual	GRUPO HP - BANCO DE HORAS	3	6	6	t	2026-07-21 01:33:05.354177+00	2026-07-21 01:33:05.354182+00	\N	\N
23	6	10	2026-01-31	20481.98	manual	HP - INTEGRAÇÃO ONFLY	3	6	6	t	2026-07-21 01:33:26.842708+00	2026-07-21 01:33:26.842713+00	\N	\N
24	6	10	2026-01-31	2700.00	manual	QUALITE - ACELERADOR REFORMA TRIBUTÁRIA	3	6	6	t	2026-07-21 01:33:47.264502+00	2026-07-21 01:33:47.264508+00	\N	\N
25	6	10	2026-01-31	15020.12	manual	HP - INTEGRACAO RM X SOC	3	6	6	t	2026-07-21 01:34:09.245744+00	2026-07-21 01:34:09.24575+00	\N	\N
26	6	10	2026-01-31	38676.96	manual	RZK - BH - DEV - 01/2026	3	6	6	t	2026-07-21 01:34:34.58586+00	2026-07-21 01:34:34.585865+00	\N	\N
16	6	8	2026-07-21	5000.00	manual	\N	3	6	6	f	2026-07-21 01:28:53.568192+00	2026-07-21 01:36:10.076169+00	\N	\N
17	6	8	2026-07-21	8000.00	manual	\N	3	6	6	f	2026-07-21 01:30:06.722573+00	2026-07-21 01:36:12.876765+00	\N	\N
27	6	10	2026-03-26	84337.35	manual	GRUPO HP - ROLLOUT VAREJO - PRIMEIRA PARTE (MAAS)	3	6	6	t	2026-07-21 01:39:26.352058+00	2026-07-21 01:39:26.352066+00	\N	\N
28	6	10	2026-03-31	14545.34	manual	TOTVS RS - FSW - PRINCESA DO VALE	3	6	6	t	2026-07-21 01:39:46.802648+00	2026-07-21 01:39:46.802657+00	\N	\N
29	6	10	2026-03-31	85902.96	manual	TOTVS RS - ERP FELICE	3	6	6	t	2026-07-21 01:40:04.788571+00	2026-07-21 01:40:04.78858+00	\N	\N
30	6	10	2026-03-31	47027.01	manual	TOTVS RS - FELICE CUSTOMIZAÇÃO	3	6	6	t	2026-07-21 01:40:24.090532+00	2026-07-21 01:40:24.090539+00	\N	\N
31	6	10	2026-04-14	51807.58	manual	TOTVS RS - FELICE	3	6	6	t	2026-07-21 01:40:56.432207+00	2026-07-21 01:40:56.432212+00	\N	\N
32	6	10	2026-04-30	308872.67	manual	TOTVS RS - GREEN PORT	3	6	6	t	2026-07-21 01:41:20.46591+00	2026-07-21 01:41:20.465917+00	\N	\N
33	6	10	2026-04-30	30537.03	manual	GRUPO HP - ROLLOUT VAREJO - SEGUNDA PARTE (SIAN)	3	6	6	t	2026-07-21 01:41:40.478785+00	2026-07-21 01:41:40.47879+00	\N	\N
34	6	10	2026-04-30	832052.18	manual	TOTVS RS - ERP PT - ECOVIX	3	6	6	t	2026-07-21 01:41:59.679885+00	2026-07-21 01:41:59.67989+00	\N	\N
35	6	10	2026-05-30	34563.25	manual	TOTVS RS - FSW - ALPHA QUIMICA	3	6	6	t	2026-07-21 01:42:24.45573+00	2026-07-21 01:42:24.455737+00	\N	\N
36	6	10	2026-05-31	5060.00	manual	CAPUL - INT. PONTO E FOLHA (ATA DE REUNIÃO)	3	6	6	t	2026-07-21 01:42:45.124986+00	2026-07-21 01:42:45.124992+00	\N	\N
37	6	10	2026-05-31	9638.75	manual	GRUPO HP - FSW IMP. XLS PIS/COFINS	3	6	6	t	2026-07-21 01:43:09.261142+00	2026-07-21 01:43:09.261146+00	\N	\N
38	6	10	2026-06-30	45783.13	manual	JF FOODS - ASSESSMENT PRECIFICACAO	3	6	6	t	2026-07-21 01:43:33.839415+00	2026-07-21 01:43:33.83942+00	\N	\N
39	6	10	2026-06-30	10490.85	manual	CAPUL - BI LOGISTICA	3	6	6	t	2026-07-21 01:43:52.31997+00	2026-07-21 01:43:52.319977+00	\N	\N
40	12	10	2026-02-27	4965.44	manual	Relatório personalizado - ICF	3	6	6	t	2026-07-21 01:45:43.408885+00	2026-07-21 01:45:43.408891+00	\N	\N
41	12	10	2026-02-28	5468.75	manual	QUALITE - PORTAL DE PROJETOS - ETIQUETA	3	6	6	t	2026-07-21 01:46:08.376174+00	2026-07-21 01:46:08.376179+00	\N	\N
42	12	10	2026-03-31	3012.45	manual	Ciatoy - Acelerador de Configurador de Tributos	3	6	6	t	2026-07-21 01:46:34.691273+00	2026-07-21 01:46:34.69128+00	\N	\N
43	12	10	2026-03-31	5399.93	manual	Oportunidade GEES AGRICULTURA	3	6	6	t	2026-07-21 01:46:55.827788+00	2026-07-21 01:46:55.827794+00	\N	\N
44	12	10	2026-04-30	27148.23	manual	GRUPO HP - REVISÃO DOS CUSTOS	3	6	6	t	2026-07-21 01:47:18.078403+00	2026-07-21 01:47:18.078409+00	\N	\N
45	12	10	2026-04-30	11228.03	manual	Integração PowerCurve - Curinga dos Pneus	3	6	6	t	2026-07-21 01:47:38.17789+00	2026-07-21 01:47:38.177896+00	\N	\N
46	12	10	2026-04-30	29400.59	manual	GRUPO HP - ECD	3	6	6	t	2026-07-21 01:47:56.168093+00	2026-07-21 01:47:56.168097+00	\N	\N
47	12	10	2026-04-30	9960.00	manual	Grupo HP - BH - RM	3	6	6	t	2026-07-21 01:48:11.148697+00	2026-07-21 01:48:11.148704+00	\N	\N
48	12	10	2026-04-30	12882.00	manual	BH - PRIMETEK COMPUTADORES	3	6	6	t	2026-07-21 01:48:28.004863+00	2026-07-21 01:48:28.004871+00	\N	\N
49	9	9	2026-03-31	13187.28	manual	KSS TERCEIRIZACAO DE MAO DE OBRAS LTDA	3	4	4	t	2026-07-21 01:52:58.105096+00	2026-07-21 01:52:58.105105+00	\N	\N
50	9	10	2026-04-30	30000.10	manual	Winthor - Celeiro e Racoes e Cereais	3	4	4	t	2026-07-21 01:53:36.573728+00	2026-07-21 01:53:36.573733+00	\N	\N
51	9	8	2026-04-30	11799.20	manual	Winthor - Celeiro e Racoes e Cereais	3	4	4	t	2026-07-21 01:53:55.921746+00	2026-07-21 01:53:55.921752+00	\N	\N
52	9	9	2026-04-30	1613.20	manual	Winthor - Celeiro e Racoes e Cereais	3	4	4	t	2026-07-21 01:54:13.038868+00	2026-07-21 01:54:13.038872+00	\N	\N
54	6	10	2026-07-21	25000.00	manual	Segundo teste com novos dados	3	6	6	t	2026-07-21 02:01:11.360899+00	2026-07-21 02:01:11.360905+00	\N	\N
53	6	8	2026-07-21	15000.00	manual	Teste com dados visíveis	3	6	6	f	2026-07-21 02:01:11.300213+00	2026-07-21 02:04:43.071265+00	\N	\N
55	8	11	2026-05-31	1200.00	manual	AMS - UNIVERSO RECICLAVEIS	3	4	4	t	2026-07-21 02:06:17.278414+00	2026-07-21 02:06:17.27842+00	\N	\N
56	8	11	2026-05-31	1167.08	manual	A.M.S. - SERRA SUL	3	4	4	t	2026-07-21 02:07:06.882604+00	2026-07-21 02:07:06.88261+00	\N	\N
57	8	10	2026-01-20	79546.58	manual	WT - SOL MAT DE CONSTRUÇÃO	3	4	4	t	2026-07-21 02:10:35.01992+00	2026-07-21 02:10:35.019924+00	\N	\N
58	8	10	2026-01-30	89950.00	manual	RH PROTHEUS - VALENCIO	3	4	4	t	2026-07-21 02:10:54.042401+00	2026-07-21 02:10:54.042407+00	\N	\N
59	8	10	2026-02-24	650.00	manual	OHMS - RM LAYOUT COMPRAS	3	4	4	t	2026-07-21 02:11:18.831635+00	2026-07-21 02:11:18.831642+00	\N	\N
60	8	10	2026-03-12	216068.16	manual	ERP RM e EDUCONNECT - FADESA	3	4	4	t	2026-07-21 02:11:43.723286+00	2026-07-21 02:11:43.723294+00	\N	\N
61	8	10	2026-04-30	3733.34	manual	PATRIMONIAL - WINTHOR INTERGRAOS	3	4	4	t	2026-07-21 02:12:13.067186+00	2026-07-21 02:12:13.067192+00	\N	\N
62	8	10	2026-05-31	79198.56	manual	SCS - FRANCAL	3	4	4	t	2026-07-21 02:12:35.884775+00	2026-07-21 02:12:35.884781+00	\N	\N
63	8	10	2026-07-31	53364.16	manual	WT - GOIAS CIMENTO	3	4	4	t	2026-07-21 02:13:04.08098+00	2026-07-21 02:13:04.08099+00	\N	\N
64	8	10	2026-07-31	1569.24	manual	MIGRACAO SCS - MARABÁ FERRO E AÇO	3	4	4	t	2026-07-21 02:13:22.021853+00	2026-07-21 02:13:22.02186+00	\N	\N
65	8	10	2026-07-31	11773.12	manual	MELHORES PRATICAS - LINHARES	3	4	4	t	2026-07-21 02:13:43.795821+00	2026-07-21 02:13:43.795829+00	\N	\N
66	8	8	2026-01-20	48985.27	manual	WT - SOL MAT DE CONSTRUÇÃO	3	4	4	t	2026-07-21 02:14:09.120028+00	2026-07-21 02:14:09.120035+00	\N	\N
67	8	8	2026-01-30	10086.40	manual	RH PROTHEUS - VALENCIO	3	4	4	t	2026-07-21 02:14:30.663762+00	2026-07-21 02:14:30.663767+00	\N	\N
68	8	8	2026-01-30	5739.50	manual	CDU - Alvorada Mangueiras	3	4	4	t	2026-07-21 02:14:53.396907+00	2026-07-21 02:14:53.396914+00	\N	\N
69	8	8	2026-02-27	6301.00	manual	MDT - Valencio	3	4	4	t	2026-07-21 02:15:25.986383+00	2026-07-21 02:15:25.98639+00	\N	\N
70	8	8	2026-03-12	28566.40	manual	ERP RM e EDUCONNECT - FADESA	3	4	4	t	2026-07-21 02:15:57.053935+00	2026-07-21 02:15:57.053942+00	\N	\N
71	8	8	2026-03-31	7846.00	manual	CDU - LUMAR JPS	3	4	4	t	2026-07-21 02:16:19.170043+00	2026-07-21 02:16:19.170049+00	\N	\N
72	8	8	2026-03-31	9642.60	manual	CDU - INTERGRAOS	3	4	4	t	2026-07-21 02:16:41.104028+00	2026-07-21 02:16:41.104034+00	\N	\N
73	8	8	2026-03-31	1948.00	manual	CDU - NUTRISOLO	3	4	4	t	2026-07-21 02:16:59.350671+00	2026-07-21 02:16:59.350677+00	\N	\N
74	8	8	2026-03-31	7012.80	manual	CDU - CONSTRUCENTER	3	4	4	t	2026-07-21 02:17:17.787548+00	2026-07-21 02:17:17.787552+00	\N	\N
75	8	8	2026-03-31	3724.40	manual	CDU / SMS SOMMA DISTRIBUICAO	3	4	4	t	2026-07-21 02:17:36.556612+00	2026-07-21 02:17:36.556618+00	\N	\N
76	8	8	2026-03-31	15772.15	manual	CDU / SMS - DISTRIBUIDORA TOCANTINS	3	4	4	t	2026-07-21 02:17:55.788626+00	2026-07-21 02:17:55.788641+00	\N	\N
77	8	8	2026-03-31	3923.00	manual	CDU - SMS LINHARES	3	4	4	t	2026-07-21 02:18:16.681227+00	2026-07-21 02:18:16.681232+00	\N	\N
78	8	8	2026-03-31	4285.60	manual	CDU - BROKER CARAJAS	3	4	4	t	2026-07-21 02:18:35.831559+00	2026-07-21 02:18:35.831566+00	\N	\N
79	8	8	2026-04-30	5651.67	manual	PATRIMONIAL - WINTHOR INTERGRAOS	3	4	4	t	2026-07-21 02:18:56.018262+00	2026-07-21 02:18:56.018269+00	\N	\N
80	8	8	2026-05-31	3245.25	manual	CDU - COM FERRO	3	4	4	t	2026-07-21 02:19:20.478666+00	2026-07-21 02:19:20.478674+00	\N	\N
81	8	8	2026-05-31	14368.47	manual	CDU - SMS <> INTERGRÃOS - FILIAL RONDON	3	4	4	t	2026-07-21 02:19:39.885728+00	2026-07-21 02:19:39.885732+00	\N	\N
82	8	8	2026-05-31	1956.36	manual	CDU - NUTRISOLO	3	4	4	t	2026-07-21 02:20:05.752705+00	2026-07-21 02:20:05.752712+00	\N	\N
95	8	9	2026-01-30	404.79	manual	CDU - Alvorada Mangueiras	3	4	4	t	2026-07-21 02:27:17.515162+00	2026-07-21 02:27:17.515169+00	\N	\N
96	8	9	2026-02-25	427.19	manual	Broker Carajas - SMS	3	4	4	t	2026-07-21 02:27:47.236518+00	2026-07-21 02:27:47.236523+00	\N	\N
97	8	9	2026-03-31	551.80	manual	CDU - LUMAR JPS	3	4	4	t	2026-07-21 02:28:08.177486+00	2026-07-21 02:28:08.177491+00	\N	\N
98	8	9	2026-03-31	688.25	manual	CDU - INTERGRAOS	3	4	4	t	2026-07-21 02:28:31.519628+00	2026-07-21 02:28:31.519633+00	\N	\N
99	8	9	2026-03-31	137.45	manual	CDU - NUTRISOLO	3	4	4	t	2026-07-21 02:28:40.357382+00	2026-07-21 02:28:40.357386+00	\N	\N
100	8	9	2026-03-31	454.23	manual	CDU - CONSTRUCENTER	3	4	4	t	2026-07-21 02:28:54.876903+00	2026-07-21 02:28:54.876909+00	\N	\N
101	8	9	2026-03-31	460.19	manual	CDU / SMS SOMMA DISTRIBUICAO	3	4	4	t	2026-07-21 02:29:21.017112+00	2026-07-21 02:29:21.017117+00	\N	\N
102	8	9	2026-03-31	1381.00	manual	CDU / SMS - DISTRIBUIDORA TOCANTINS	3	4	4	t	2026-07-21 02:29:51.675731+00	2026-07-21 02:29:51.675737+00	\N	\N
103	8	9	2026-03-31	298.68	manual	CDU - SMS LINHARES	3	4	4	t	2026-07-21 02:30:06.979712+00	2026-07-21 02:30:06.979719+00	\N	\N
104	8	9	2026-03-31	374.14	manual	TROCA DE LICENCA - MARABÁ FERRO E AÇO	3	4	4	t	2026-07-21 02:30:24.873336+00	2026-07-21 02:30:24.873341+00	\N	\N
105	8	9	2026-03-31	302.82	manual	CDU - BROKER CARAJAS	3	4	4	t	2026-07-21 02:30:45.798312+00	2026-07-21 02:30:45.798318+00	\N	\N
83	8	8	2026-07-31	76750.17	manual	WT - GOIAS CIMENTO	3	4	4	t	2026-07-21 02:20:34.809936+00	2026-07-21 02:20:34.809942+00	\N	\N
84	8	9	2026-01-30	4511.13	manual	RH PROTHEUS - VALENCIO	3	4	4	t	2026-07-21 02:22:37.696157+00	2026-07-21 02:22:37.696162+00	\N	\N
85	8	9	2026-01-30	4000.06	manual	SAAS CLOUD - SOL MATCON	3	4	4	t	2026-07-21 02:23:02.736145+00	2026-07-21 02:23:02.736151+00	\N	\N
86	8	9	2026-01-30	549.03	manual	TEF - CONCILIADOR JG SUPRIMENTOS	3	4	4	t	2026-07-21 02:23:29.197534+00	2026-07-21 02:23:29.19754+00	\N	\N
89	8	9	2026-02-27	823.00	manual	MDT - Valencio	3	4	4	t	2026-07-21 02:24:45.390776+00	2026-07-21 02:24:45.390782+00	\N	\N
93	8	9	2026-07-31	3705.00	manual	WT - GOIAS CIMENTO	3	4	4	t	2026-07-21 02:26:31.336482+00	2026-07-21 02:26:31.336487+00	\N	\N
94	8	9	2026-01-20	6919.54	manual	WT - SOL MAT DE CONSTRUÇÃO	3	4	4	t	2026-07-21 02:26:54.663955+00	2026-07-21 02:26:54.663961+00	\N	\N
106	8	9	2026-04-30	324.49	manual	PATRIMONIAL - WINTHOR INTERGRAOS	3	4	4	t	2026-07-21 02:31:08.537602+00	2026-07-21 02:31:08.53761+00	\N	\N
107	8	9	2026-05-31	281.90	manual	CDU - COM FERRO	3	4	4	t	2026-07-21 02:31:33.930375+00	2026-07-21 02:31:33.93038+00	\N	\N
108	8	9	2026-05-31	1250.65	manual	CDU - SMS <> INTERGRÃOS - FILIAL RONDON	3	4	4	t	2026-07-21 02:31:52.78446+00	2026-07-21 02:31:52.784465+00	\N	\N
109	8	9	2026-05-31	137.65	manual	CDU - NUTRISOLO	3	4	4	t	2026-07-21 02:32:06.270756+00	2026-07-21 02:32:06.270763+00	\N	\N
110	8	9	2026-07-20	7770.00	manual	WT - GOIAS CIMENTO	3	4	4	t	2026-07-21 02:32:40.1763+00	2026-07-21 02:32:40.176306+00	\N	\N
87	8	9	2026-01-31	2034.49	manual	CLOUD - MARABÁ FERRO E AÇO	3	4	4	t	2026-07-21 02:23:53.43229+00	2026-07-21 02:23:53.432295+00	\N	\N
88	8	9	2026-01-31	2220.66	manual	CARENCIA - JM ENGENHARIA E CONSTRUCAO	3	4	4	t	2026-07-21 02:24:13.947638+00	2026-07-21 02:24:13.947644+00	\N	\N
90	8	9	2026-02-28	2220.31	manual	REC - CARENCIA -  HARPIA CENTRO DE MANUTENCAO DE EQUIPAMENTOS	3	4	4	t	2026-07-21 02:25:06.906435+00	2026-07-21 02:25:06.906441+00	\N	\N
91	8	9	2026-03-12	10464.38	manual	ERP RM e EDUCONNECT - FADESA	3	4	4	t	2026-07-21 02:25:42.211283+00	2026-07-21 02:25:42.211288+00	\N	\N
92	8	9	2026-05-31	2494.36	manual	SAAS  SYSTOCK - MORAL AUTO PEÇAS	3	4	4	t	2026-07-21 02:26:07.242663+00	2026-07-21 02:26:07.242668+00	\N	\N
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
8	Walison	$2b$12$IztcJ0mz9JEl5qABXknpv.c1wCfN0boAPUXaRPCqGWUWuul1UIZC2	vendedor	Walison	\N	8	f	2026-07-21 01:08:45.586661+00	2026-07-21 01:09:07.287483+00	\N	\N
9	walison.ferreira	$2b$12$YZLzXPsiNQMrYFX9E3FZme3dB17kh9c6atTtPpp9NlQ63Jg9OqZFW	vendedor	Walison Ferreira	\N	8	t	2026-07-21 01:09:31.918452+00	2026-07-21 01:09:31.918458+00	\N	\N
10	klandson.freitas	$2b$12$0iMpHU2SIrbpyZiRunsv9e16AOVAgPqqIiOPWRD8iacwdgZute59W	vendedor	Klandson Freiras	\N	9	t	2026-07-21 01:10:03.912423+00	2026-07-21 01:10:03.912432+00	\N	\N
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
12	6	Patricia Campos	\N	t	2026-07-21 01:13:44.354018+00	2026-07-21 01:13:44.354024+00	\N	\N
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

SELECT pg_catalog.setval('public.meta_id_seq', 156, true);


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

SELECT pg_catalog.setval('public.realizado_id_seq', 110, true);


--
-- Name: unidade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.unidade_id_seq', 6, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.usuario_id_seq', 10, true);


--
-- Name: vendedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metas_user
--

SELECT pg_catalog.setval('public.vendedor_id_seq', 12, true);


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

\unrestrict lOMYJsBc54dnLOn2BVdxg8lCIeJXdyyyF0YX96dcZxiTgAWIpEmSsXWnLLcRZnl

