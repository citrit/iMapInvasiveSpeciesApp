--
-- PostgreSQL database dump
--

-- Started on 2013-06-05 16:55:59

SET statement_timeout = 0;
SET client_encoding = 'WIN1252';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = sde, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 4295 (class 1259 OID 25799293)
-- Dependencies: 8 1038
-- Name: imiadmin_observation; Type: TABLE; Schema: sde; Owner: sde; Tablespace: 
--

CREATE TABLE imiadmin_observation (
    objectid integer NOT NULL,
    objectid_1 numeric(38,8),
    objectid_12 numeric(38,8),
    obsid character varying(255),
    statespeciesid character varying(255),
    observer character varying(255),
    obsorg character varying(255),
    obsdate timestamp without time zone,
    obsstate character varying(255),
    obscountyname character varying(255),
    obsnationalownership character varying(255),
    obssitedirections character varying(255),
    obssiteaccess character varying(255),
    obsorigxcoord numeric(38,8),
    obsorigycoord numeric(38,8),
    obsorigcoordsystem character varying(255),
    obsorigdatum character varying(255),
    obsdeterminationmethod character varying(255),
    obsmethod character varying(255),
    obscomments character varying(255),
    projectid character varying(255),
    assessmentid character varying(255),
    occurrenceid character varying(255),
    treatmentid character varying(255),
    surveyid character varying(255),
    repositoryavailable smallint,
    repositorylocation character varying(255),
    repositorybarcodeid character varying(255),
    digitalphoto smallint,
    photourl1 character varying(255),
    photocredit1 character varying(255),
    photourl2 character varying(255),
    photocredit2 character varying(255),
    photourl3 character varying(255),
    photocredit3 character varying(255),
    photourl4 character varying(255),
    photocredit4 character varying(255),
    photourl5 character varying(255),
    photocredit5 character varying(255),
    photocomments character varying(255),
    idbyexpert smallint,
    expertnameid character varying(255),
    sourceuniqueid character varying(255),
    imapdataentrydate timestamp without time zone,
    imapdataentrypersonid character varying(255),
    imapdataentrymethod character varying(255),
    imapbulkuploadid character varying(255),
    obsspeciesidmethod character varying(50),
    obsdatastatus character varying(50),
    obssuspiciousdistanceflag smallint,
    obsdeleteflag character varying(255),
    obsadmincomments character varying(255),
    obsqcdate timestamp without time zone,
    obsqcpersonid character varying(255),
    obsdate_real timestamp without time zone,
    obsorigy numeric(38,8),
    obsorigx numeric(38,8),
    obslobsdeterminationmethod character varying(255),
    ojectid numeric(38,8),
    record_id character varying(255),
    scientificname character varying(255),
    commonname character varying(255),
    organizationname character varying(255),
    observername character varying(255),
    expertnamefromuser character varying(255),
    expertnamefromadmin character varying(255),
    organization2 character varying(80),
    organization3 character varying(80),
    geom1 character varying(255),
    geom2 character varying(255),
    geom3 character varying(255),
    geom4 character varying(255),
    geom5 character varying(255),
    geom6 character varying(255),
    geom7 character varying(255),
    geom8 character varying(255),
    geom9 character varying(255),
    geom10 character varying(255),
    geom11 character varying(255),
    geom12 character varying(255),
    geom13 character varying(255),
    speciestype character varying(2),
    significantrecord smallint,
    minimum_view_level smallint,
    minimum_report_level smallint,
    minimum_download_level smallint,
    shape st_point,
    aux1 character varying(255),
    aux2 character varying(255),
    aux3 character varying(255),
    aux4 character varying(255),
    aux5 character varying(255),
    aux6 character varying(255),
    aux7 character varying(255),
    aux8 character varying(255),
    aux9 character varying(255),
    aux10 character varying(255),
    obscomments_long character varying(4000),
    obssiteaccess_long character varying(4000),
    obssitedirections_long character varying(4000),
    repositorybarcodeid_long character varying(4000)
);


ALTER TABLE sde.imiadmin_observation OWNER TO sde;

--
-- TOC entry 5212 (class 1259 OID 26215030)
-- Dependencies: 3652 4295
-- Name: a166_ix1; Type: INDEX; Schema: sde; Owner: sde; Tablespace: 
--

CREATE INDEX a166_ix1 ON imiadmin_observation USING gist (shape);


--
-- TOC entry 5213 (class 1259 OID 25800398)
-- Dependencies: 3652 4295
-- Name: a84_ix1_nydev; Type: INDEX; Schema: sde; Owner: sde; Tablespace: 
--

CREATE INDEX a84_ix1_nydev ON imiadmin_observation USING gist (shape);


--
-- TOC entry 5214 (class 1259 OID 26001196)
-- Dependencies: 4295
-- Name: r1277_sde_rowid_uk_nydev; Type: INDEX; Schema: sde; Owner: sde; Tablespace: 
--

CREATE UNIQUE INDEX r1277_sde_rowid_uk_nydev ON imiadmin_observation USING btree (obsid) WITH (fillfactor=75);


--
-- TOC entry 5215 (class 1259 OID 25800399)
-- Dependencies: 4295
-- Name: r127_sde_rowid_uk_nydev; Type: INDEX; Schema: sde; Owner: sde; Tablespace: 
--

CREATE UNIQUE INDEX r127_sde_rowid_uk_nydev ON imiadmin_observation USING btree (obsid) WITH (fillfactor=75);


--
-- TOC entry 5216 (class 1259 OID 26215031)
-- Dependencies: 4295
-- Name: r208_sde_rowid_uk; Type: INDEX; Schema: sde; Owner: sde; Tablespace: 
--

CREATE UNIQUE INDEX r208_sde_rowid_uk ON imiadmin_observation USING btree (objectid) WITH (fillfactor=75);


--
-- TOC entry 5219 (class 0 OID 0)
-- Dependencies: 4295
-- Name: imiadmin_observation; Type: ACL; Schema: sde; Owner: sde
--

REVOKE ALL ON TABLE imiadmin_observation FROM PUBLIC;
REVOKE ALL ON TABLE imiadmin_observation FROM sde;
GRANT ALL ON TABLE imiadmin_observation TO sde;


-- Completed on 2013-06-05 16:56:00

--
-- PostgreSQL database dump complete
--

