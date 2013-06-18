--
-- PostgreSQL database dump
--

-- Started on 2013-06-05 16:58:08

SET statement_timeout = 0;
SET client_encoding = 'WIN1252';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 4474 (class 1259 OID 26215422)
-- Dependencies: 57
-- Name: imiadmin_project; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE imiadmin_project (
    id integer NOT NULL,
    "projectName" character varying(255) NOT NULL,
    "projectDescription" text NOT NULL,
    "projectLeadContact_id" integer,
    "projectStartDate" date,
    "projectEndDate" date,
    "projectActive" boolean NOT NULL,
    "projectComments" text,
    project_citizen_science boolean NOT NULL,
    project_land_manager_project boolean NOT NULL,
    "projectUpdateDate" date,
    "projectUpdateAuthor_id" integer,
    "projectInitialDate" date,
    "projectInitialAuthor_id" integer,
    project_cost double precision
);


ALTER TABLE public.imiadmin_project OWNER TO postgres;

--
-- TOC entry 4473 (class 1259 OID 26215420)
-- Dependencies: 4474 57
-- Name: imiadmin_project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE imiadmin_project_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.imiadmin_project_id_seq OWNER TO postgres;

--
-- TOC entry 5224 (class 0 OID 0)
-- Dependencies: 4473
-- Name: imiadmin_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE imiadmin_project_id_seq OWNED BY imiadmin_project.id;


--
-- TOC entry 5225 (class 0 OID 0)
-- Dependencies: 4473
-- Name: imiadmin_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('imiadmin_project_id_seq', 120, true);


--
-- TOC entry 5212 (class 2604 OID 26215425)
-- Dependencies: 4473 4474 4474
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE imiadmin_project ALTER COLUMN id SET DEFAULT nextval('imiadmin_project_id_seq'::regclass);


--
-- TOC entry 5221 (class 0 OID 26215422)
-- Dependencies: 4474
-- Data for Name: imiadmin_project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY imiadmin_project (id, "projectName", "projectDescription", "projectLeadContact_id", "projectStartDate", "projectEndDate", "projectActive", "projectComments", project_citizen_science, project_land_manager_project, "projectUpdateDate", "projectUpdateAuthor_id", "projectInitialDate", "projectInitialAuthor_id", project_cost) FROM stdin;
46	Another tester (3/17/10)	Happy St. Patty's Day	176	\N	\N	f		f	f	2010-08-25	44	2010-03-17	47	\N
38	Union College - Professor Corbin's Ecology Class	each fall, Prof. Corbin's Ecology Class submits records of invasive species for Schenectady County	175	2009-11-23	\N	f		f	f	2010-09-09	294	2009-11-25	44	\N
51	SLELO NFWF 5	Tug Hill inventory	406	2010-06-01	2010-09-01	t		f	f	\N	\N	2010-07-07	164	\N
65	SUNY Oneonta-Biological Field Station	For SUNY Oneonta Biological Field Station	367	\N	\N	t		f	f	2011-06-23	367	2011-06-20	294	\N
48	APIPP 2010 Terrestrial Inventory	Regional rapid assessment of terrestrial invasive plants in the Adirondack Park. Antioch grad student Kathleen Wiley is working on this project with The Nature Conservancy (TNC) and Adirondack Park Invasive Plant Program (APIPP).	240	2010-05-01	2010-11-30	t		f	f	2010-12-01	453	2010-04-07	47	\N
60	The NYS Brown Marmorated Stink Bug Survey	Documenting the spread of the brown marmorated stink bug across NYS	561	\N	\N	t		f	f	2011-06-23	294	2011-05-23	294	\N
81	NYSDEC Southern Lake Ontario Mussel Inventory	NYSDEC Southern Lake Ontario Mussel Inventory	1366	\N	2012-11-10	t		f	f	\N	\N	2011-11-10	151	\N
57	Lake Classification and Inventory Survey - 2011	A state-wide, multi-phase lake, pond, and reservoir monitoring program linked to the same geographic rotational schedule as the larger Rotating Integrated Basin Studies (RIBS) program.	233	\N	2011-12-31	t		f	f	2011-04-20	294	2011-04-20	294	\N
58	Citizens Statewide Lake Assessment Program (CSLAP) - 2011	A volunteer lake monitoring program conducted jointly by the NYSDEC Division of Water and the NY Federation of Lake Associations, a not-for-profit coalition of lake associations, lakefront residents, and other organizations dedicated to the preservation and restoration of New York lakes.	233	\N	2011-12-31	t		f	f	\N	\N	2011-04-20	294	\N
59	Lake Association Watcher - 2011	Project to allow the public to enter data that Scott Kishbaugh (DEC) can monitor as part of the state water quality monitoring efforts.	233	\N	2011-12-31	t		f	f	2011-04-20	294	2011-04-20	294	\N
54	Fake data - online training 11/17/10	Fake data entered during Heidi's online WebEx training on November 17th, 2010.	963	2010-11-17	2010-11-17	f		f	f	2011-05-20	294	2010-11-16	453	\N
75	Susquehanna Invasives Paddle	Susquehanna Invasives Paddle	1009	2011-07-25	2011-07-28	t	Cooperstown, NY to Sidney, NY; 52 mile stretch of Susquehanna River	f	f	2011-08-08	1009	2011-08-08	294	\N
49	SLELO summer 2009	field work conducted by summer staff	1021	2009-05-01	2009-10-31	t		f	f	2011-06-16	294	2010-04-09	44	\N
50	SLELO DOS 2010	Eastern Lake Ontario Inventory and management	1021	2010-06-01	\N	t		f	f	2011-06-16	294	2010-07-07	164	\N
64	SUNY Oneonta-Marsh Thistle	For SUNY Oneonta Biological Field Station	367	\N	2011-12-31	t		f	f	2011-06-23	367	2011-06-20	294	\N
73	TNC-ENY	Created per Arianne Messerman's request	396	\N	2012-01-01	t		f	f	2011-07-18	294	2011-07-18	294	\N
43	Beta 1 Testing	NYNHP Testers	888	2009-12-08	2011-06-30	f		f	f	2011-08-01	574	2009-12-08	151	\N
71	FAKE DATA (2011 WNY PRISM TRAINING)	Fake data entered for training purposes	981	2011-07-06	2011-07-08	f		f	f	2011-08-04	574	2011-07-06	453	\N
76	NYC Parks historical data	Data collected by NYC Parks, Natural Resources Group (NRG)	1122	\N	\N	t	All data is based on field entitation reports conducted by NRG field crews. More extensive information is typically available for each entry than is included here. Historical forest data ranges from the mid 1980's until present. Contact Tim Wenskus at NYC Parks, Natural Resources Group (NRG) for more information.	f	f	2011-08-08	1122	2011-08-08	294	\N
72	NYSG AIS  Resource Education 2011	NY Sea Grant AIS \r\nResource Education 2011	1080	\N	2012-01-01	t		f	f	2011-11-30	1080	2011-07-18	294	\N
63	SUNY Oneonta-Catskill Aquatics	For SUNY Oneonta Biological Field Station	367	2011-05-01	2011-09-30	t	Bill Harman and his team at SUNY Oneonta's Biological Field Station conducted a comprehensive all taxa inventory of 2 lakes and a stream in each of eight watersheds in the CRISP region. This newly aquired information along with existing data paints a very good picture of the distribution of invasive aquatic species in the Catskills.	f	f	2012-01-03	522	2011-06-20	294	\N
83	APIPP 2011 Volunteer Lake Monitoring Program	APIPP 2011 Volunteer Lake Monitoring Program	1193	\N	\N	t		f	f	\N	\N	2012-01-04	294	\N
85	Cornell DNR Forest Health	Mark's project	267	\N	\N	t		f	f	\N	\N	2012-02-20	522	\N
61	Peconic Dunes County Park invasive species	Summer camp project	984	\N	\N	t		f	f	2012-06-05	294	2011-05-23	294	\N
66	Lower Hudson Swallowwort Project	PRISM Swallowwort Project	251	\N	2012-06-22	t		f	f	2012-07-09	294	2011-06-22	151	\N
77	Cayuga Hydrilla Project	Cayuga inlet	221	2011-08-01	2012-12-10	t		f	f	2012-12-10	221	2011-08-25	294	\N
87	Protectors of Pine Oak Woods	We have for some 15 years now been doing a monthly minor invasive species removal in the Staten Island Greenbelt, concerning ourselves mostly with removing invasive twining vines from saplings, but occasionally going after other invasive species. 	1469	\N	2013-03-05	t		f	f	\N	\N	2012-03-05	151	\N
74	Testing LIVE 1.5	testing projects	521	\N	\N	t		f	f	2013-01-28	294	2011-07-28	294	\N
56	Fake Data - iMap Training Sessions	These need to be deleted after each training session.	142	2012-03-26	2012-03-26	f		f	f	2013-02-06	142	2011-02-22	294	\N
67	New York-New Jersey Trail Conference	volunteer trail surveys	693	2011-05-15	2014-12-31	t		f	f	2013-02-14	453	2011-06-22	151	\N
82	Montezuma Wetlands Complex	Montezuma Wetlands Complex....\r\n	1179	\N	\N	t	This is a coordinated partnership in the Montezuma Wetlands Complex of volunteers and staff known as the Montezuma Alliance for the Restoration of Species and Habitats (MARSH).  MARSH is supported by The Friends of the Montezuma Wetlands Complex, US Fish and Wildlife Service, NYSDEC, and the Montezuma Audubon Center. 	f	f	2013-04-02	142	2011-12-21	294	1000000
69	OPRHP Statewide Observations	 This will allow statewide real-time observations to be entered and prioritization by the IS team in Albany and further assessment by Bob O'Brien and/or the biologists. 	251	\N	2012-06-27	t		f	f	2013-04-25	142	2011-06-27	164	5400.29
80	BSA 163 (Boy Scouts of America)	Boy Scout project.	463	2011-08-19	2011-08-27	t	Boy Scout Troup 163 from Olive, NY hiked over 100 miles from the Ashokan Reservoir to Central Park following the path of the aqueduct and searching for 5 invasive species along the way. They were looking for Norway maple, giant hogweed, swallow-wort (pale and black), mile-a-minute and Asiatic bittersweet. 	f	f	2012-03-13	522	2011-10-12	574	\N
88	ALB Invasives - Brooklyn	Jeff's project for Tim Leslie	1565	\N	\N	t		f	f	2012-03-26	294	2012-03-22	294	\N
92	Shoelace Park	Shoelace Park	1479	\N	\N	t		f	f	\N	\N	2012-04-03	294	\N
103	Inwood Park-LEAF Educators Training	Training for High School educators through TNC LEAF	521	\N	\N	t		t	f	\N	\N	2012-06-25	294	\N
91	Owasco Lake Association	Owasco Lake Association	164	\N	2013-04-03	t		f	f	2012-04-04	151	2012-04-03	151	\N
89	New York Metropolitan Flora Project	In 1990 the Garden embarked on the New York Metropolitan Flora project (NYMF), a multi-year effort to document the flora in all counties within a 50-mile radius of New York City, including all of Long Island, southeastern New York State, northern New Jersey and Fairfield County, Connecticut.	120	\N	\N	t		f	f	2012-04-17	522	2012-04-02	522	\N
86	Saranac Lake Japanese Knotweed Treatment	Saranac Lake Japanese Knotweed Treatment	1192	\N	2013-02-28	t		f	f	2012-04-17	1192	2012-02-28	151	\N
94	SUNY Potsdam Environmental Studies majors	SUNY Potsdam Environmental Studies majors	449	\N	2013-04-23	t		f	f	2012-04-23	151	2012-04-23	151	\N
95	Fake Data: User Feedback Session 5/1/12	Fake data entered for this session	453	2012-05-01	2012-05-01	t		f	f	2012-04-30	453	2012-04-30	453	\N
102	LIISMA Ash Tree Surveys	Survey of ash trees to look for signs of Emerald Ash Borer	152	\N	2013-01-01	t		f	f	2012-06-25	574	2012-06-18	294	\N
98	OPRHP Finger Lakes HWA Surveys	OPRHP Finger Lakes HWA Surveys	1007	\N	2013-05-05	t		f	f	\N	\N	2012-05-03	294	\N
97	OPRHP Minnewaska SPP Insect Surveys	OPRHP Minnewaska SPP Insect Surveys	1007	\N	2013-05-05	t		f	t	2012-07-05	453	2012-05-03	294	\N
96	Esopus Bend Creek 	Esopus Bend Creek - Smartphone Event	463	2012-05-08	2013-05-08	t		f	f	2012-05-09	151	2012-04-30	151	\N
99	APIPP 2012 Volunteer Lake Monitoring Program	APIPP 2012 Volunteer Lake Monitoring Program	1193	\N	2013-01-01	t		f	f	2012-08-15	44	2012-05-15	294	\N
105	ELO Shoreline Dunes Project	This project is to assess and document Glossy Buckthorn, Pale Swallow-wort and the presence of the Altica subplicata beetle.	1216	\N	\N	t	This project is to assess and document Glossy Buckthorn, Pale Swallow-wort and Altica subplicata beetle.	f	f	2012-07-11	1216	2012-07-09	294	\N
104	Salmon River Estuary Project	his project is to assess Japanese Knotweed within the estuary and to develop a comprehensive knotweed management plan.\r\n	1216	\N	2012-12-31	t	This project is to assess Japanese Knotweed within the estuary and to develop a comprehensive knotweed management plan.	f	f	2012-07-11	1216	2012-07-09	294	\N
107	SLELO - General 	For the SLELO PRISM data that does not fit into the other SLELO projects that Rob Williams is lead contact for.	1216	\N	\N	t		f	f	2012-07-11	294	2012-07-10	574	\N
109	REG62012	DEC submissions to Region 6 for 2012. Handled by Anne Resseguie.	1745	\N	\N	t		f	t	2012-07-20	294	2012-07-20	294	\N
100	Art Omi - Japanese Knotweed	Japanese Knotweed eradication program at a site in Columbia County	1672	\N	2014-06-14	t	Glenda will be doing this project under the auspice of the Columbia/Greene Master Gardener Volunteer Program and will be liaising with Rick Burstell who is the Columbia/Greene invasive species specialist.	f	f	2012-08-23	1672	2012-06-14	151	\N
101	Reinstein Woods Garlic Mustard Challenge	Reinstein Woods Garlic Mustard Challenge	737	\N	2013-06-15	t		f	f	2012-10-02	453	2012-06-15	151	\N
93	RIIPP	knotweed control in ADK Park	1604	\N	\N	t	Japanese Knotweed Control in Adirondack Park	f	f	2012-12-13	294	2012-04-17	294	\N
106	Fishkill Ridge ISPZ Survey	This project will document all the survey/mapping work associated with the creation of a Invasive Species Prevention Zone in the Fishkill Ridge Conservation Area. The Fishkill Ridge Conservation Area is over 1500 acres consisting of parcels owned by Scenic Hudson and New York State Office of Parks Recreation and Historic Places. The Conservation Area sits within a larger assemblage of preserved land as part of the Hudson Highland State Park and adjacent to Scenic Hudson's Mt. Beacon Park. The goal of the project is to determine whether an invasive species prevention zone is possible given the following criteria: \r\n\r\nInvasive Species Prevention Zone is over 500 acres in size \r\nThe area contains species or natural community of state or regional importance \r\nThe areas total percent cover of invasive species is no greater than 5% and no 100% acre area has a % cover greater than 10%. \r\nThe first two criteria are already met and the survey work will determine if the third one is achievable.\r\n\r\n	309	2012-06-01	2013-06-30	t		f	f	2012-07-30	309	2012-07-09	44	\N
110	Sam's Point Preserve	TNC project for SCA intern.	1817	\N	\N	t		f	f	2012-08-07	574	2012-08-07	574	\N
111	Rockefeller State Park Preserve	Rockefeller State Park Preserve	128	2010-02-01	2013-01-01	t	Establishing baseline invasive plant species patterns for Rockefeller State Park Preserve, Westchester NY	f	f	2012-09-07	128	2012-08-08	294	\N
112	Intervale Lowlands	Invasive species management on a 160 acre nature preserve along the Ausable River in the Adirondacks	1957	\N	\N	t		t	t	\N	\N	2012-09-16	294	\N
114	Hydrilla Delineation (Western NY)-test	test	985	2012-09-18	2013-12-31	f		f	f	2012-09-20	294	2012-09-19	294	\N
113	Hydrilla Delineation (Western NY)	Determine extent of hydrilla infestation	320	2012-09-18	2013-09-01	t		f	t	2012-09-26	294	2012-09-19	294	\N
115	Reinstein Woods Trail Tuesdays	Brittany, please enter a project description in this field. 	737	\N	\N	t		f	f	2012-10-02	453	2012-10-02	453	\N
116	Test-1.95	checking to see if project members can see project in query (might just be project leaders)	985	2012-12-13	2012-12-21	t		f	f	2012-12-14	294	2012-12-14	294	\N
117	lead person project	work hard	221	\N	\N	t		f	f	2012-12-18	142	2012-12-18	142	\N
55	4-H Lazy Ranchers Club	Ask Margo	1980	\N	2013-01-31	t		f	f	2012-12-18	142	2011-01-10	250	\N
70	CCE - Onondaga	multi-year work Citizen Science Work through Onondaga County CCE	961	\N	2013-07-05	t		f	f	2012-12-18	142	2011-07-06	44	\N
118	Look for kudzu	Look for kudzu all over	2122	\N	\N	t		f	f	2013-04-11	2122	2012-12-18	142	\N
79	2011 - Saranac Lake High School - AP Biology	2011 - Saranac Lake High School - AP Biology	1167	\N	2012-09-22	t		f	f	2013-04-02	142	2011-09-22	151	20.155999999999999
45	Fake data - entered for testing purposes (Heidi delete)	need to allow Beta testers to enter fake data if necessary (entering real data is preferred)	985	2010-03-15	2010-06-16	f		f	f	2013-03-19	142	2010-03-09	44	\N
68	Hudson Valley Mile-a-Minute Project	Dedicated to detection and control of mile-a-minute vine in the Hudson Valley area.	1127	\N	2012-06-30	t		f	f	2013-03-22	142	2011-06-22	294	10000.1
62	TNC Great Lakes Restoration Initiative (GLRI)	SLELO TNC field work	1021	2011-06-14	2014-06-14	t		f	f	2013-03-22	142	2011-06-16	294	100.98999999999999
108	aa_need to place in correct project	Project was created and selected in data entry, but a bug is not letting it show as a valid choice when viewing the observation	985	\N	\N	t		f	f	2013-03-22	142	2012-07-11	294	\N
52	2010 - Saratoga 4-H	First 4-H training session	484	2010-08-19	\N	t		f	f	2013-03-22	142	2010-08-19	294	\N
84	Amphibian & Reptile Atlas Project (Herp Atlas)	A ten year survey (1990-1999) that was designed to document the geographic distribution of New York State's herpetofauna.	1495	1990-01-01	1999-12-31	t	t	f	f	2013-03-22	142	2012-02-10	453	\N
53	2010-Union College-Corbin Plant Ecology Class	Jeff Corbin (professor at Union College) has students in his Plant Ecology class record invasive plant observations	175	2010-09-09	\N	t		f	f	2013-03-22	142	2010-09-09	294	100000
90	2009-2010 Great Lakes Center Exotic Mollusc Survey	Occurrence of exotic molluscs studied for trematodes in the Great Lakes Region in 2009 and 2010.	1496	2009-06-15	2010-08-01	t	dds	f	f	2013-03-22	142	2012-04-02	522	500
119	swh	swh	1793	\N	2013-03-29	t	asdf	f	f	2013-05-30	142	2013-03-22	142	44
78	2011-Union College-Corbin Plant Ecology Class	Jeff Corbin (professor at Union College) has students in his Plant Ecology class record invasive plant observations	175	2011-09-09	2011-12-01	t		f	f	2013-03-22	142	2011-09-08	294	99.010000000000005
120	swh1	swh1	1009	\N	\N	t		f	f	\N	\N	2013-03-22	142	\N
\.


--
-- TOC entry 5214 (class 2606 OID 26215430)
-- Dependencies: 4474 4474
-- Name: imiadmin_project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY imiadmin_project
    ADD CONSTRAINT imiadmin_project_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 1259 OID 26217903)
-- Dependencies: 4474
-- Name: imiadmin_project_projectInitialAuthor_id; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX "imiadmin_project_projectInitialAuthor_id" ON imiadmin_project USING btree ("projectInitialAuthor_id");


--
-- TOC entry 5216 (class 1259 OID 26217901)
-- Dependencies: 4474
-- Name: imiadmin_project_projectLeadContact_id; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX "imiadmin_project_projectLeadContact_id" ON imiadmin_project USING btree ("projectLeadContact_id");


--
-- TOC entry 5217 (class 1259 OID 26217902)
-- Dependencies: 4474
-- Name: imiadmin_project_projectUpdateAuthor_id; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX "imiadmin_project_projectUpdateAuthor_id" ON imiadmin_project USING btree ("projectUpdateAuthor_id");


--
-- TOC entry 5218 (class 2606 OID 26215441)
-- Dependencies: 4454 4474
-- Name: imiadmin_project_projectInitialAuthor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY imiadmin_project
    ADD CONSTRAINT "imiadmin_project_projectInitialAuthor_id_fkey" FOREIGN KEY ("projectInitialAuthor_id") REFERENCES imiadmin_person(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5220 (class 2606 OID 26215431)
-- Dependencies: 4454 4474
-- Name: imiadmin_project_projectLeadContact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY imiadmin_project
    ADD CONSTRAINT "imiadmin_project_projectLeadContact_id_fkey" FOREIGN KEY ("projectLeadContact_id") REFERENCES imiadmin_person(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5219 (class 2606 OID 26215436)
-- Dependencies: 4454 4474
-- Name: imiadmin_project_projectUpdateAuthor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY imiadmin_project
    ADD CONSTRAINT "imiadmin_project_projectUpdateAuthor_id_fkey" FOREIGN KEY ("projectUpdateAuthor_id") REFERENCES imiadmin_person(id) DEFERRABLE INITIALLY DEFERRED;


-- Completed on 2013-06-05 16:58:09

--
-- PostgreSQL database dump complete
--

