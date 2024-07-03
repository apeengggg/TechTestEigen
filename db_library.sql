--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

-- Started on 2024-07-03 16:56:21

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
-- TOC entry 203 (class 1259 OID 16406)
-- Name: tb_m_books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_m_books (
    book_id integer NOT NULL,
    book_code character varying(10),
    book_title character varying(100),
    book_author character varying(100),
    book_stock smallint
);


ALTER TABLE public.tb_m_books OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 16404)
-- Name: tb_m_books_book_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_m_books_book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_m_books_book_id_seq OWNER TO postgres;

--
-- TOC entry 3015 (class 0 OID 0)
-- Dependencies: 202
-- Name: tb_m_books_book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_m_books_book_id_seq OWNED BY public.tb_m_books.book_id;


--
-- TOC entry 201 (class 1259 OID 16398)
-- Name: tb_m_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_m_members (
    member_id integer NOT NULL,
    member_code character varying(5),
    member_name character varying(100),
    penalized_end date
);


ALTER TABLE public.tb_m_members OWNER TO postgres;

--
-- TOC entry 200 (class 1259 OID 16396)
-- Name: tb_m_members_member_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_m_members_member_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_m_members_member_id_seq OWNER TO postgres;

--
-- TOC entry 3016 (class 0 OID 0)
-- Dependencies: 200
-- Name: tb_m_members_member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_m_members_member_id_seq OWNED BY public.tb_m_members.member_id;


--
-- TOC entry 205 (class 1259 OID 16414)
-- Name: tb_r_borrow_books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_r_borrow_books (
    borrow_id integer NOT NULL,
    member_id integer,
    book_id integer,
    borrow_start date DEFAULT now(),
    borrow_end date
);


ALTER TABLE public.tb_r_borrow_books OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 16412)
-- Name: tb_r_booked_books_booked_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_r_booked_books_booked_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_r_booked_books_booked_id_seq OWNER TO postgres;

--
-- TOC entry 3017 (class 0 OID 0)
-- Dependencies: 204
-- Name: tb_r_booked_books_booked_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_r_booked_books_booked_id_seq OWNED BY public.tb_r_borrow_books.borrow_id;


--
-- TOC entry 2863 (class 2604 OID 16409)
-- Name: tb_m_books book_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_m_books ALTER COLUMN book_id SET DEFAULT nextval('public.tb_m_books_book_id_seq'::regclass);


--
-- TOC entry 2862 (class 2604 OID 16401)
-- Name: tb_m_members member_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_m_members ALTER COLUMN member_id SET DEFAULT nextval('public.tb_m_members_member_id_seq'::regclass);


--
-- TOC entry 2864 (class 2604 OID 16417)
-- Name: tb_r_borrow_books borrow_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_r_borrow_books ALTER COLUMN borrow_id SET DEFAULT nextval('public.tb_r_booked_books_booked_id_seq'::regclass);


--
-- TOC entry 3007 (class 0 OID 16406)
-- Dependencies: 203
-- Data for Name: tb_m_books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_m_books (book_id, book_code, book_title, book_author, book_stock) FROM stdin;
2	SHR-1	A Study in Scarlet	Arthur Conan Doyle	1
3	TW-11	Twilight	Stephenie Meyer	1
4	HOB-83	The Hobbit, or There and Back Again	J.R.R. Tolkien	1
5	NRN-7	The Lion, the Witch and the Wardrobe	C.S. Lewis	1
1	JK-45	Harry Potter	J.K. Rowling	1
\.


--
-- TOC entry 3005 (class 0 OID 16398)
-- Dependencies: 201
-- Data for Name: tb_m_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_m_members (member_id, member_code, member_name, penalized_end) FROM stdin;
2	M002	Ferry	\N
3	M003	Putri	\N
1	M001	Angga	2024-07-02
\.


--
-- TOC entry 3009 (class 0 OID 16414)
-- Dependencies: 205
-- Data for Name: tb_r_borrow_books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_r_borrow_books (borrow_id, member_id, book_id, borrow_start, borrow_end) FROM stdin;
36	1	3	2024-07-03	2024-07-03
37	1	1	2024-06-20	2024-07-03
40	1	1	2024-07-03	\N
41	1	5	2024-07-03	\N
\.


--
-- TOC entry 3018 (class 0 OID 0)
-- Dependencies: 202
-- Name: tb_m_books_book_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_m_books_book_id_seq', 5, true);


--
-- TOC entry 3019 (class 0 OID 0)
-- Dependencies: 200
-- Name: tb_m_members_member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_m_members_member_id_seq', 3, true);


--
-- TOC entry 3020 (class 0 OID 0)
-- Dependencies: 204
-- Name: tb_r_booked_books_booked_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_r_booked_books_booked_id_seq', 41, true);


--
-- TOC entry 2869 (class 2606 OID 16411)
-- Name: tb_m_books tb_m_books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_m_books
    ADD CONSTRAINT tb_m_books_pkey PRIMARY KEY (book_id);


--
-- TOC entry 2867 (class 2606 OID 16403)
-- Name: tb_m_members tb_m_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_m_members
    ADD CONSTRAINT tb_m_members_pkey PRIMARY KEY (member_id);


--
-- TOC entry 2871 (class 2606 OID 16419)
-- Name: tb_r_borrow_books tb_r_booked_books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_r_borrow_books
    ADD CONSTRAINT tb_r_booked_books_pkey PRIMARY KEY (borrow_id);


--
-- TOC entry 2873 (class 2606 OID 16425)
-- Name: tb_r_borrow_books tb_r_booked_books_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_r_borrow_books
    ADD CONSTRAINT tb_r_booked_books_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.tb_m_books(book_id);


--
-- TOC entry 2872 (class 2606 OID 16420)
-- Name: tb_r_borrow_books tb_r_booked_books_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_r_borrow_books
    ADD CONSTRAINT tb_r_booked_books_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.tb_m_members(member_id);


-- Completed on 2024-07-03 16:56:22

--
-- PostgreSQL database dump complete
--

