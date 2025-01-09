--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: debts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.debts (
    debt_id uuid NOT NULL,
    transaction_id uuid NOT NULL,
    group_id bigint NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text,
    payer character varying(255) NOT NULL,
    debtor character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'unsettled'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.debts OWNER TO postgres;

--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    group_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    created_by character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: spending; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spending (
    group_id bigint NOT NULL,
    transaction_id uuid,
    payer character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text
);


ALTER TABLE public.spending OWNER TO postgres;

--
-- Name: sponsor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sponsor (
    id uuid NOT NULL,
    group_id bigint NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_email character varying(255) NOT NULL
);


ALTER TABLE public.sponsor OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    transaction_id uuid NOT NULL,
    group_id bigint NOT NULL,
    payer character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_groups (
    user_id integer NOT NULL,
    group_id bigint NOT NULL
);


ALTER TABLE public.user_groups OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: debts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.debts (debt_id, transaction_id, group_id, amount, reason, payer, debtor, status, created_at) FROM stdin;
507a0820-1981-4d44-8cac-314a71de5270	538609bd-b81d-4872-bbbe-3fdd44fde53f	1735482644172	10.00	as	p@p.com	Ayushpc025@gmail.com	settled	2024-12-29 20:07:46.145769
5cb09246-62e2-439f-a791-c63106a15888	d6b0e76d-9bd9-4789-8d31-e0f2cb512bfc	1735482644172	20.00	r	p@p.com	Ayushpc025@gmail.com	settled	2024-12-29 20:30:46.782162
a74dc651-b1e0-4b56-aea1-e1bb4d360772	875bae32-cd9d-4d72-b389-011c46267c4a	1735482644172	50.00	as	Ayushpc025@gmail.com	p@p.com	settled	2024-12-29 20:04:21.386792
850f446a-93ec-4b6a-a54a-24e02f709adc	4a96940b-3b85-4a34-a050-764fd8a2d70a	1735482644172	50.00	fs	p@p.com	Ayushpc025@gmail.com	settled	2024-12-30 08:13:12.807764
23c279cf-a5b4-4832-b3ec-402faa409ba8	b741383e-069b-4b81-bd0e-73328751b80f	1735482644172	60.00	khana	p@p.com	Ayushpc025@gmail.com	unsettled	2025-01-05 10:33:43.554064
bbd786a9-0b31-4a24-b532-6a7da7eaa7da	b7623520-c629-4f84-a315-3bba7f7458d6	1735482644172	60.00	2	Ayushpc025@gmail.com	p@p.com	settled	2024-12-30 08:47:43.562126
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (group_id, name, created_by, created_at) FROM stdin;
1735482644172	Test	p@p.com	2024-12-29 20:00:44.173143
1735527201338	a	p@p.com	2024-12-30 08:23:21.340715
\.


--
-- Data for Name: spending; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spending (group_id, transaction_id, payer, amount, reason) FROM stdin;
1735482644172	\N	Ayushpc025@gmail.com	250.00	Spending update
1735482644172	\N	p@p.com	370.00	Spending update
1735527201338	\N	p@p.com	0.00	Spending update
\.


--
-- Data for Name: sponsor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sponsor (id, group_id, amount, reason, date, user_email) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (transaction_id, group_id, payer, amount, reason, created_at) FROM stdin;
64fcab25-e1a3-49c3-8594-0fa30d0b95f1	1735482644172	p@p.com	120.00	aS	2024-12-29 20:01:01.309059
875bae32-cd9d-4d72-b389-011c46267c4a	1735482644172	Ayushpc025@gmail.com	100.00	as	2024-12-29 20:04:21.384325
538609bd-b81d-4872-bbbe-3fdd44fde53f	1735482644172	p@p.com	20.00	as	2024-12-29 20:07:46.144462
d6b0e76d-9bd9-4789-8d31-e0f2cb512bfc	1735482644172	p@p.com	40.00	r	2024-12-29 20:30:46.780269
4a96940b-3b85-4a34-a050-764fd8a2d70a	1735482644172	p@p.com	100.00	fs	2024-12-30 08:13:12.804371
b7623520-c629-4f84-a315-3bba7f7458d6	1735482644172	Ayushpc025@gmail.com	120.00	2	2024-12-30 08:47:43.559855
b741383e-069b-4b81-bd0e-73328751b80f	1735482644172	p@p.com	120.00	khana	2025-01-05 10:33:43.551128
\.


--
-- Data for Name: user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_groups (user_id, group_id) FROM stdin;
2	1735482644172
1	1735482644172
2	1735527201338
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, email, username, password) FROM stdin;
1	Ayush Mishra	Ayushpc025@gmail.com	ayush_mishra16	$2b$10$pR4I.htC2d/4xJ7OEJ0KTOGAOAaRdOcDrhDWdaxq4Rn5PNv4YbI.i
2	Dokja	p@p.com	Demon	$2b$10$bT7IXN16Kwjbv0.HSk0e..SG.J/KXsnMraxagfoURiIVXDXdW.Gxa
\.


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 2, true);


--
-- Name: debts debts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_pkey PRIMARY KEY (debt_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- Name: sponsor sponsor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor
    ADD CONSTRAINT sponsor_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);


--
-- Name: spending unique_group_payer; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spending
    ADD CONSTRAINT unique_group_payer UNIQUE (group_id, payer);


--
-- Name: user_groups user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (user_id, group_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: debts debts_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(group_id);


--
-- Name: spending spending_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spending
    ADD CONSTRAINT spending_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(group_id);


--
-- Name: spending spending_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spending
    ADD CONSTRAINT spending_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id);


--
-- Name: sponsor sponsor_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor
    ADD CONSTRAINT sponsor_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(group_id);


--
-- Name: transactions transactions_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(group_id);


--
-- Name: user_groups user_groups_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(group_id);


--
-- Name: user_groups user_groups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

