--
-- PostgreSQL database dump
--

\restrict Q4D1nJrSlqcF9pZ5zLebm6GUl7Km2XJrD12Cj2iv8S798w6liujrweVmEHkI0aH

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AssetMovementType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetMovementType" AS ENUM (
    'ASSIGNMENT',
    'RETURN',
    'TRANSFER_OUT',
    'TRANSFER_IN',
    'MAINTENANCE_START',
    'MAINTENANCE_COMPLETE',
    'PROCUREMENT',
    'DISPOSAL'
);


--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'ACTIVE',
    'RETURNED'
);


--
-- Name: AuditResult; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuditResult" AS ENUM (
    'SUCCESS',
    'FAILURE'
);


--
-- Name: DepreciationMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DepreciationMethod" AS ENUM (
    'STRAIGHT_LINE',
    'DOUBLE_DECLINING'
);


--
-- Name: DisposalReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DisposalReason" AS ENUM (
    'RETIRED',
    'DAMAGED',
    'LOST',
    'DESTROYED',
    'SOLD',
    'SCRAPPED'
);


--
-- Name: DisposalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DisposalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: EquipmentCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EquipmentCategory" AS ENUM (
    'WEAPON',
    'VEHICLE',
    'AMMUNITION',
    'COMMUNICATION',
    'MEDICAL',
    'OTHER'
);


--
-- Name: EquipmentCondition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EquipmentCondition" AS ENUM (
    'NEW',
    'GOOD',
    'FAIR',
    'DAMAGED',
    'UNSERVICEABLE'
);


--
-- Name: EquipmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EquipmentStatus" AS ENUM (
    'AVAILABLE',
    'ASSIGNED',
    'IN_TRANSIT',
    'MAINTENANCE',
    'DAMAGED',
    'LOST',
    'RETIRED'
);


--
-- Name: InspectionResult; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InspectionResult" AS ENUM (
    'PENDING',
    'PASS',
    'FAIL'
);


--
-- Name: MaintenanceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MaintenanceStatus" AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: MaintenanceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MaintenanceType" AS ENUM (
    'PREVENTIVE',
    'CORRECTIVE',
    'INSPECTION',
    'CALIBRATION'
);


--
-- Name: MovementReferenceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MovementReferenceType" AS ENUM (
    'ASSIGNMENT',
    'TRANSFER',
    'MAINTENANCE',
    'PROCUREMENT',
    'DISPOSAL'
);


--
-- Name: MovementType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MovementType" AS ENUM (
    'INITIAL_STOCK',
    'PURCHASE',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'ASSIGNMENT',
    'ASSIGNMENT_RETURN',
    'EXPENDITURE'
);


--
-- Name: NotificationPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'MAINTENANCE',
    'PROCUREMENT',
    'TRANSFER',
    'ASSIGNMENT',
    'DISPOSAL',
    'SYSTEM'
);


--
-- Name: OrgLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrgLevel" AS ENUM (
    'COMMAND',
    'DIVISION',
    'BRIGADE',
    'BATTALION',
    'COMPANY',
    'PLATOON',
    'SECTION'
);


--
-- Name: PerformedByType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PerformedByType" AS ENUM (
    'USER',
    'SYSTEM'
);


--
-- Name: PersonnelStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PersonnelStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DEPLOYED',
    'ON_LEAVE'
);


--
-- Name: ProcurementStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProcurementStatus" AS ENUM (
    'DRAFT',
    'APPROVED',
    'PARTIALLY_RECEIVED',
    'RECEIVED',
    'CANCELLED'
);


--
-- Name: ReferenceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReferenceType" AS ENUM (
    'INITIAL_STOCK',
    'PURCHASE',
    'TRANSFER',
    'ASSIGNMENT',
    'ASSIGNMENT_RETURN',
    'EXPENDITURE'
);


--
-- Name: ReportJobStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReportJobStatus" AS ENUM (
    'PENDING',
    'GENERATING',
    'COMPLETED',
    'FAILED'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'BASE_COMMANDER',
    'LOGISTICS_OFFICER'
);


--
-- Name: SupplierStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SupplierStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: TransferStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransferStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'IN_TRANSIT',
    'COMPLETED',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: Unit; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Unit" AS ENUM (
    'NOS',
    'ROUNDS',
    'BOXES',
    'LITRES',
    'KGS',
    'METRES'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DEACTIVATED'
);


--
-- Name: WarrantyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WarrantyStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'VOIDED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AssetValuation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AssetValuation" (
    id text NOT NULL,
    "equipmentAssetId" text NOT NULL,
    "purchaseValue" numeric(65,30) NOT NULL,
    "currentValue" numeric(65,30) NOT NULL,
    "bookValue" numeric(65,30) NOT NULL,
    "residualValue" numeric(65,30) NOT NULL,
    "depreciationMethod" public."DepreciationMethod" DEFAULT 'STRAIGHT_LINE'::public."DepreciationMethod" NOT NULL,
    "depreciationRate" numeric(65,30) NOT NULL,
    "lastCalculatedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Assignment" (
    id text NOT NULL,
    "baseId" text NOT NULL,
    "assignedTo" text NOT NULL,
    status public."AssignmentStatus" DEFAULT 'ACTIVE'::public."AssignmentStatus" NOT NULL,
    "assignedById" text NOT NULL,
    remarks text,
    "assignedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "equipmentAssetId" text NOT NULL,
    "returnedAt" timestamp(3) without time zone,
    "returnedById" text,
    "personnelId" text
);


--
-- Name: Attachment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Attachment" (
    id text NOT NULL,
    filename text NOT NULL,
    "mimeType" text NOT NULL,
    "fileSize" integer NOT NULL,
    "storageKey" text NOT NULL,
    "uploadedById" text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "isLatest" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "entityId" text NOT NULL,
    "entityType" text NOT NULL,
    module text NOT NULL,
    "newValues" jsonb,
    "oldValues" jsonb,
    "performedByType" public."PerformedByType" DEFAULT 'USER'::public."PerformedByType" NOT NULL,
    result public."AuditResult" DEFAULT 'SUCCESS'::public."AuditResult" NOT NULL,
    "userAgent" text
);


--
-- Name: Base; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Base" (
    id text NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    code text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: CronJobLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CronJobLog" (
    id text NOT NULL,
    "jobName" text NOT NULL,
    "startedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    status text NOT NULL,
    error text
);


--
-- Name: DepreciationHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DepreciationHistory" (
    id text NOT NULL,
    "equipmentAssetId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    amount numeric(65,30) NOT NULL,
    "previousBookValue" numeric(65,30) NOT NULL,
    "newBookValue" numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Disposal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Disposal" (
    id text NOT NULL,
    "equipmentAssetId" text NOT NULL,
    "disposalReason" public."DisposalReason" NOT NULL,
    status public."DisposalStatus" DEFAULT 'PENDING'::public."DisposalStatus" NOT NULL,
    remarks text,
    "approvedById" text,
    "disposedById" text,
    "disposalDate" timestamp(3) without time zone,
    "bookValue" numeric(65,30),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Equipment" (
    id text NOT NULL,
    name text NOT NULL,
    category public."EquipmentCategory" NOT NULL,
    unit public."Unit" NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "expectedLifeYears" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    model text,
    specifications text,
    "supplierId" text
);


--
-- Name: EquipmentAsset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EquipmentAsset" (
    id text NOT NULL,
    "equipmentId" text NOT NULL,
    "baseId" text NOT NULL,
    "serialNumber" text NOT NULL,
    "purchaseDate" timestamp(3) without time zone,
    "purchaseCost" numeric(65,30) NOT NULL,
    status public."EquipmentStatus" DEFAULT 'AVAILABLE'::public."EquipmentStatus" NOT NULL,
    condition public."EquipmentCondition" DEFAULT 'NEW'::public."EquipmentCondition" NOT NULL,
    remarks text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "qrCodeUrl" text,
    "unitId" text
);


--
-- Name: Expenditure; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Expenditure" (
    id text NOT NULL,
    "baseId" text NOT NULL,
    quantity integer NOT NULL,
    reason text NOT NULL,
    "expendedById" text NOT NULL,
    remarks text,
    "expendedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "equipmentAssetId" text NOT NULL
);


--
-- Name: Inspection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inspection" (
    id text NOT NULL,
    "equipmentAssetId" text NOT NULL,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "completedDate" timestamp(3) without time zone,
    "inspectorId" text NOT NULL,
    result public."InspectionResult" DEFAULT 'PENDING'::public."InspectionResult" NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inventory" (
    id text NOT NULL,
    "baseId" text NOT NULL,
    "equipmentId" text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "availableQuantity" integer DEFAULT 0 NOT NULL,
    "damagedQuantity" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "maintenanceQuantity" integer DEFAULT 0 NOT NULL,
    "minimumStock" integer DEFAULT 0 NOT NULL,
    remarks text,
    "allocatedQuantity" integer DEFAULT 0 NOT NULL,
    "inTransitQuantity" integer DEFAULT 0 NOT NULL
);


--
-- Name: Ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Ledger" (
    id text NOT NULL,
    "baseId" text NOT NULL,
    "movementType" public."MovementType" NOT NULL,
    quantity integer NOT NULL,
    "referenceType" public."ReferenceType" NOT NULL,
    "purchaseId" text,
    "transferId" text,
    "assignmentId" text,
    "expenditureId" text,
    "createdById" text NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "equipmentAssetId" text NOT NULL
);


--
-- Name: Maintenance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Maintenance" (
    id text NOT NULL,
    "equipmentAssetId" text NOT NULL,
    "maintenanceType" public."MaintenanceType" NOT NULL,
    status public."MaintenanceStatus" DEFAULT 'SCHEDULED'::public."MaintenanceStatus" NOT NULL,
    description text NOT NULL,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "expectedCompletionDate" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "vendorName" text,
    "technicianName" text,
    "estimatedCost" numeric(65,30),
    "actualCost" numeric(65,30),
    remarks text,
    "createdById" text NOT NULL,
    "completedById" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MovementHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MovementHistory" (
    id text NOT NULL,
    "equipmentAssetId" text NOT NULL,
    "movementType" public."AssetMovementType" NOT NULL,
    "sourceBaseId" text,
    "destinationBaseId" text,
    "referenceType" public."MovementReferenceType" NOT NULL,
    "referenceId" text NOT NULL,
    "performedById" text NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" NOT NULL,
    priority public."NotificationPriority" DEFAULT 'LOW'::public."NotificationPriority" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "actionUrl" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "readAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone
);


--
-- Name: OrganizationUnit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrganizationUnit" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    level public."OrgLevel" NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Personnel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Personnel" (
    id text NOT NULL,
    "serviceNumber" text NOT NULL,
    rank text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "unitId" text,
    email text,
    phone text,
    status public."PersonnelStatus" DEFAULT 'ACTIVE'::public."PersonnelStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Procurement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Procurement" (
    id text NOT NULL,
    "procurementNumber" text NOT NULL,
    supplier text NOT NULL,
    status public."ProcurementStatus" DEFAULT 'DRAFT'::public."ProcurementStatus" NOT NULL,
    "purchaseDate" timestamp(3) without time zone NOT NULL,
    "expectedDeliveryDate" timestamp(3) without time zone NOT NULL,
    "receivedDate" timestamp(3) without time zone,
    "totalCost" numeric(65,30) DEFAULT 0 NOT NULL,
    remarks text,
    "baseId" text NOT NULL,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "supplierId" text
);


--
-- Name: ProcurementItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProcurementItem" (
    id text NOT NULL,
    "procurementId" text NOT NULL,
    "equipmentId" text NOT NULL,
    quantity integer NOT NULL,
    "receivedQuantity" integer DEFAULT 0 NOT NULL,
    "unitCost" numeric(65,30) NOT NULL
);


--
-- Name: Purchase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Purchase" (
    id text NOT NULL,
    "baseId" text NOT NULL,
    "equipmentId" text NOT NULL,
    quantity integer NOT NULL,
    vendor text,
    "purchasedById" text NOT NULL,
    remarks text,
    "purchasedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ReportJob; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReportJob" (
    id text NOT NULL,
    "reportType" text NOT NULL,
    "exportFormat" text NOT NULL,
    "requestedById" text NOT NULL,
    status public."ReportJobStatus" DEFAULT 'PENDING'::public."ReportJobStatus" NOT NULL,
    filters jsonb,
    "storageKey" text,
    "errorMessage" text,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "contactName" text,
    email text,
    phone text,
    address text,
    status public."SupplierStatus" DEFAULT 'ACTIVE'::public."SupplierStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SystemConfig; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SystemConfig" (
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Transfer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transfer" (
    id text NOT NULL,
    "fromBaseId" text NOT NULL,
    "toBaseId" text NOT NULL,
    quantity integer NOT NULL,
    "transferredById" text NOT NULL,
    remarks text,
    status public."TransferStatus" DEFAULT 'PENDING'::public."TransferStatus" NOT NULL,
    "transferredAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "equipmentAssetId" text NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "baseId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Warranty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Warranty" (
    id text NOT NULL,
    "equipmentAssetId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "vendorId" text,
    "coverageDetails" text,
    status public."WarrantyStatus" DEFAULT 'ACTIVE'::public."WarrantyStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: AssetValuation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AssetValuation" (id, "equipmentAssetId", "purchaseValue", "currentValue", "bookValue", "residualValue", "depreciationMethod", "depreciationRate", "lastCalculatedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Assignment" (id, "baseId", "assignedTo", status, "assignedById", remarks, "assignedAt", "createdAt", "updatedAt", "equipmentAssetId", "returnedAt", "returnedById", "personnelId") FROM stdin;
cms5hi51x0001a4cnbqnfsazm	cms4ssnl30010wgcn57ig7zgx	Sgt. Dhanush Maddila	RETURNED	cms4s0e6s000uwgcnyxqshukf	Returned via tactical control dashboard.	2026-07-29 02:47:26.228	2026-07-29 02:47:26.229	2026-07-29 03:57:36.803	cms5ghtm800062kcnktxseaec	2026-07-29 03:57:36.802	cms4s0e6s000uwgcnyxqshukf	\N
cms5n4bi10002zscnwyq215u3	cms4ssnl30010wgcn57ig7zgx	Officer	RETURNED	cms4s0e6s000uwgcnyxqshukf	Returned via tactical control dashboard.	2026-07-29 05:24:39.096	2026-07-29 05:24:39.097	2026-07-29 08:02:04.759	cms5ky0ik000490cnj2nuicai	2026-07-29 08:02:04.758	cms4s0e6s000uwgcnyxqshukf	\N
cms5t3rpx001j28cnlxl74jov	cms5rq4ic00094scnuxune2bu	Maj. Dhanush Srinivas	ACTIVE	cms4s0e6s000uwgcnyxqshukf	\N	2026-07-29 08:12:11.156	2026-07-29 08:12:11.157	2026-07-29 08:12:11.157	cms5sok0u000c28cny5s1ok74	\N	\N	\N
\.


--
-- Data for Name: Attachment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Attachment" (id, filename, "mimeType", "fileSize", "storageKey", "uploadedById", "entityType", "entityId", version, "isLatest", metadata, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "userId", action, "ipAddress", "createdAt", "entityId", "entityType", module, "newValues", "oldValues", "performedByType", result, "userAgent") FROM stdin;
cms388p9x0000w0cnvmu9721m	cms28x4pl0000lgcnv6qv5pc7	VALIDATION_RUN	127.0.0.1	2026-07-27 12:52:36.981	visibility-layer-validator	System	TEST_SYSTEM	{"run": true}	{"run": false}	USER	SUCCESS	Antigravity Validator
cms4ix74k0000kwcnfxcq4yb6	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 10:39:22.196	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	axios/1.18.1
cms4ixdup0001kwcnu7rf7dj9	cms28x4pl0000lgcnv6qv5pc7	USER_LOGIN	::1	2026-07-28 10:39:30.913	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	null	null	USER	SUCCESS	axios/1.18.1
cms4j0z2z0000yccnflw91m65	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 10:42:18.395	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4j326s0001yccntzdqaah7	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 10:43:55.732	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4j3nfo0002yccn8gj3frqe	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 10:44:23.269	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4jakfs0003yccnllpgfxe5	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 10:49:45.976	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4jatqw0004yccnpccip7v3	cms28x4pl0000lgcnv6qv5pc7	USER_LOGIN	::1	2026-07-28 10:49:58.04	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qce480000wgcnoel1p7hn	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 14:07:08.408	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qdtqq0001wgcncoj3ierp	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 14:08:15.314	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qe6u30002wgcnsydz67cp	cms4iqim9000188cnwzfnlda5	USER_LOGIN	::1	2026-07-28 14:08:32.283	cms4iqim9000188cnwzfnlda5	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qee140003wgcnnfd10l1d	cms28x4pl0000lgcnv6qv5pc7	USER_LOGIN	::1	2026-07-28 14:08:41.608	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qhwbm0004wgcngx98vi2n	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 14:11:25.282	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qi8hp0005wgcnu9l69t19	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 14:11:41.053	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qi9bb0006wgcnaagtgetd	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 14:11:42.119	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qiai00007wgcny9nhrf6n	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 14:11:43.656	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qmrmf0008wgcnzg0oncy9	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 14:15:12.471	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4qnqgf0009wgcnvl70l77c	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 14:15:57.615	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4qo7hc000awgcnghb5za9m	cms28x4pl0000lgcnv6qv5pc7	USER_LOGIN	::1	2026-07-28 14:16:19.681	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	null	null	USER	SUCCESS	PostmanRuntime/7.55.1
cms4qogzz000bwgcnfprwexrs	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 14:16:32.015	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qoohg000cwgcnwoqwrvxl	cms28x4pl0000lgcnv6qv5pc7	USER_LOGIN	::1	2026-07-28 14:16:41.716	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4qps9u000dwgcn5cx8qenp	\N	FAILED_LOGIN	::1	2026-07-28 14:17:33.282	unknown	User	AUTH	{"email": "bademail@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4qyzif000ewgcnc14obgbr	cms4iqilr000088cnopgis8av	FAILED_LOGIN	::1	2026-07-28 14:24:42.567	cms4iqilr000088cnopgis8av	User	AUTH	{"email": "alexander.reeves@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4qzab7000fwgcnrs743xv0	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 14:24:56.563	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4qzyq9000gwgcn0z2xok1w	cms4iqilr000088cnopgis8av	FAILED_LOGIN	::1	2026-07-28 14:25:28.209	cms4iqilr000088cnopgis8av	User	AUTH	{"email": "alexander.reeves@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4r1dbq000hwgcnlj8avxid	\N	FAILED_LOGIN	::1	2026-07-28 14:26:33.782	unknown	User	AUTH	{"email": "aalexander.reeves@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4r3o5y000iwgcnymsrd5ot	cms28x4pl0000lgcnv6qv5pc7	USER_LOGIN	::1	2026-07-28 14:28:21.142	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4ranq1000jwgcnc9hyrcm2	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 14:33:47.161	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4rbkj4000kwgcnkxboszcw	cms4iqilr000088cnopgis8av	FAILED_LOGIN	::1	2026-07-28 14:34:29.68	cms4iqilr000088cnopgis8av	User	AUTH	{"email": "alexander.reeves@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4rc7ya000lwgcngb7do0um	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 14:35:00.034	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4rd4qc000mwgcnr35uwde5	cms28x4pl0000lgcnv6qv5pc7	USER_LOGIN	::1	2026-07-28 14:35:42.516	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4redaa000nwgcnb6p6nd79	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 14:36:40.258	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4resky000owgcnnofyysis	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 14:37:00.082	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4rl2bu000pwgcnd26lx4gy	cms4iqilr000088cnopgis8av	FAILED_LOGIN	::1	2026-07-28 14:41:52.65	cms4iqilr000088cnopgis8av	User	AUTH	{"email": "alexander.reeves@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4rmvbf000qwgcndtjhg8ni	cms4iqilr000088cnopgis8av	USER_LOGIN	::1	2026-07-28 14:43:16.875	cms4iqilr000088cnopgis8av	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms4rx4vf000rwgcn26tc1mzn	cms28x4pl0000lgcnv6qv5pc7	USER_LOGIN	::1	2026-07-28 14:51:15.819	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4rxsm5000swgcnus4a6lfj	cms28x4pl0000lgcnv6qv5pc7	USER_UPDATE	\N	2026-07-28 14:51:46.589	cms4iqim9000188cnwzfnlda5	User	USER	{"name": "Maj. Chen", "role": "LOGISTICS_OFFICER", "email": "wei.chen@military.gov", "baseId": "cms29c8i00000rgcnffhb07zo", "status": "ACTIVE"}	{"name": "Maj. Chen", "role": "LOGISTICS_OFFICER", "email": "wei.chen@military.gov", "baseId": "cms28zhvn0000t8cnfimpr1e0", "status": "ACTIVE"}	USER	SUCCESS	\N
cms4s0e6w000vwgcnl15dh7fx	cms28x4pl0000lgcnv6qv5pc7	USER_CREATE	\N	2026-07-28 14:53:47.864	cms4s0e6s000uwgcnyxqshukf	User	USER	{"name": "Dhanush Maddila", "role": "ADMIN", "email": "dhanush@gmail.com", "baseId": null}	null	USER	SUCCESS	\N
cms4s1cbl000xwgcnaxn8671u	cms4s0e6s000uwgcnyxqshukf	USER_LOGIN	::1	2026-07-28 14:54:32.097	cms4s0e6s000uwgcnyxqshukf	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4s1jym000ywgcn762on13t	cms4s0e6s000uwgcnyxqshukf	USER_DEACTIVATE	\N	2026-07-28 14:54:41.998	cms28x4pl0000lgcnv6qv5pc7	User	USER	{"status": "DEACTIVATED"}	{"status": "ACTIVE"}	USER	SUCCESS	\N
cms4ssnl40011wgcneh8aa4z9	cms4s0e6s000uwgcnyxqshukf	BASE_CREATE	\N	2026-07-28 15:15:46.408	cms4ssnl30010wgcn57ig7zgx	Base	BASE	{"code": "CAMP-VANGUARD", "name": "Camp Vanguard", "location": "Mumbai"}	null	USER	SUCCESS	\N
cms4suwec0013wgcnjelsmz5o	cms4s0e6s000uwgcnyxqshukf	USER_UPDATE	\N	2026-07-28 15:17:31.14	cms4iqilr000088cnopgis8av	User	USER	{"name": "Col. Reeves", "role": "BASE_COMMANDER", "email": "alexander.reeves@military.gov", "baseId": "cms4ssnl30010wgcn57ig7zgx", "status": "ACTIVE"}	{"name": "Col. Reeves", "role": "BASE_COMMANDER", "email": "alexander.reeves@military.gov", "baseId": "cms28zhvn0000t8cnfimpr1e0", "status": "ACTIVE"}	USER	SUCCESS	\N
cms4sw3e00015wgcny1e7640q	cms4iqim9000188cnwzfnlda5	USER_LOGIN	::1	2026-07-28 15:18:26.856	cms4iqim9000188cnwzfnlda5	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4swbgn0016wgcnyqo0b1zs	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 15:18:37.319	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4swfao0017wgcnnpegxvm3	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-28 15:18:42.288	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4swnhn0018wgcn3zae52u0	cms4s0e6s000uwgcnyxqshukf	USER_LOGIN	::1	2026-07-28 15:18:52.907	cms4s0e6s000uwgcnyxqshukf	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms4t4oim001awgcn0mouiok0	cms4s0e6s000uwgcnyxqshukf	EQUIPMENT_CREATE	\N	2026-07-28 15:25:07.486	cms4t4oii0019wgcn19g06abw	Equipment	EQUIPMENT	{"name": "Med-Kit", "unit": "NOS", "model": "Medical-Kit-01", "category": "MEDICAL", "manufacturer": "BattleGrounds"}	null	USER	SUCCESS	\N
cms5g9jmz00002kcnsrwn1wrp	cms4s0e6s000uwgcnyxqshukf	FAILED_LOGIN	::1	2026-07-29 02:12:45.611	cms4s0e6s000uwgcnyxqshukf	User	AUTH	{"email": "dhanush@gmail.com"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms5g9pkv00012kcnecau95m1	cms4s0e6s000uwgcnyxqshukf	USER_LOGIN	::1	2026-07-29 02:12:53.311	cms4s0e6s000uwgcnyxqshukf	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms5gakut00022kcnwxhocqus	cms4iqim9000188cnwzfnlda5	USER_LOGIN	::1	2026-07-29 02:13:33.845	cms4iqim9000188cnwzfnlda5	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms5ggpth00052kcn7at1tkla	cms4s0e6s000uwgcnyxqshukf	USER_LOGIN	::1	2026-07-29 02:18:20.213	cms4s0e6s000uwgcnyxqshukf	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms5gs6bi0001jccnz1x8bszk	cms4s0e6s000uwgcnyxqshukf	ORG_UNIT_CREATE	\N	2026-07-29 02:27:14.814	cms5gs6bd0000jccnkrzuw4md	OrganizationUnit	ORGANIZATION_UNIT	{"code": "FBHQ", "name": "Fort Braxton HQ", "level": "COMMAND", "parentId": null}	null	USER	SUCCESS	\N
cms5h53a90001pwcndbjuxp97	cms4s0e6s000uwgcnyxqshukf	ORG_UNIT_CREATE	\N	2026-07-29 02:37:17.409	cms5h53a40000pwcntojstada	OrganizationUnit	ORGANIZATION_UNIT	{"code": "FBHQ1", "name": "Fort Braxton HQ 1", "level": "DIVISION", "parentId": "cms5gs6bd0000jccnkrzuw4md"}	null	USER	SUCCESS	\N
cms5h5hx10003pwcn31qy89xf	cms4s0e6s000uwgcnyxqshukf	PERSONNEL_CREATE	\N	2026-07-29 02:37:36.373	cms5h5hwx0002pwcn6qydgyi2	Personnel	PERSONNEL	{"name": "Dhanush Maddila", "rank": "Sgt.", "status": "ACTIVE", "serviceNumber": "12211645"}	null	USER	SUCCESS	\N
cms5hi53u0003a4cnm02wdtjf	cms4s0e6s000uwgcnyxqshukf	ASSIGNMENT_CREATE	\N	2026-07-29 02:47:26.299	cms5hi51x0001a4cnbqnfsazm	Assignment	ASSIGNMENT	{"baseId": "cms4ssnl30010wgcn57ig7zgx", "assignedTo": "Sgt. Dhanush Maddila", "equipmentAssetId": "cms5ghtm800062kcnktxseaec"}	null	USER	SUCCESS	\N
cms5ht57c0008a4cn7fah2m92	cms4s0e6s000uwgcnyxqshukf	MAINTENANCE_SCHEDULE	\N	2026-07-29 02:55:59.64	cms5ht5690007a4cnddh4qzkj	Maintenance	MAINTENANCE	{"scheduledDate": "2026-07-29T00:00:00.000Z", "maintenanceType": "PREVENTIVE", "equipmentAssetId": "cms5hkl3e0005a4cnwmn4k2g5", "expectedCompletionDate": null}	null	USER	SUCCESS	\N
cms5iy9xu000ca4cnmv1pdvt9	cms4s0e6s000uwgcnyxqshukf	MAINTENANCE_START	\N	2026-07-29 03:27:58.674	cms5ht5690007a4cnddh4qzkj	Maintenance	MAINTENANCE	{"status": "IN_PROGRESS"}	{"status": "SCHEDULED"}	USER	SUCCESS	\N
cms5j6bff000fa4cntk8zg0dh	cms4s0e6s000uwgcnyxqshukf	TRANSFER_CREATE	\N	2026-07-29 03:34:13.851	cms5j6b60000ea4cnefclckn3	Transfer	TRANSFER	{"status": "PENDING", "toBaseId": "cms4ssnl30010wgcn57ig7zgx", "fromBaseId": "cms29c8i00000rgcnffhb07zo", "equipmentAssetId": "cms5gg7kf00032kcnrk6v910r"}	null	USER	SUCCESS	\N
cms5j6p1v000ha4cnfback3pq	cms4s0e6s000uwgcnyxqshukf	TRANSFER_APPROVE	\N	2026-07-29 03:34:31.507	cms5j6b60000ea4cnefclckn3	Transfer	TRANSFER	{"status": "APPROVED"}	{"status": "PENDING"}	USER	SUCCESS	\N
cms5j6x2i000la4cn3r12v0r4	cms4s0e6s000uwgcnyxqshukf	TRANSFER_DISPATCH	\N	2026-07-29 03:34:41.898	cms5j6b60000ea4cnefclckn3	Transfer	TRANSFER	{"status": "IN_TRANSIT"}	{"status": "APPROVED"}	USER	SUCCESS	\N
cms5jjj07000sa4cnz0892rw8	cms4s0e6s000uwgcnyxqshukf	INSPECTION_SCHEDULE	\N	2026-07-29 03:44:30.199	cms5jjj00000ra4cng83ky6c2	Inspection	INSPECTION	{"scheduledDate": "2026-07-29T03:44:30.137Z", "equipmentAssetId": "cms5jceml000pa4cndkf1u97g"}	null	USER	SUCCESS	\N
cms5jp72d0000tscnzknugjw9	cms4s0e6s000uwgcnyxqshukf	INSPECTION_COMPLETE	\N	2026-07-29 03:48:54.661	cms5jjj00000ra4cng83ky6c2	Inspection	INSPECTION	{"result": "PASS", "completedDate": "2026-07-29T03:48:54.648Z"}	{"result": "PENDING"}	USER	SUCCESS	\N
cms5juhuq00037kcnezja9hs6	cms4s0e6s000uwgcnyxqshukf	TRANSFER_RECEIVE	\N	2026-07-29 03:53:01.922	cms5j6b60000ea4cnefclckn3	Transfer	TRANSFER	{"status": "COMPLETED"}	{"status": "IN_TRANSIT"}	USER	SUCCESS	\N
cms5k0dyn00077kcn52vvp2a8	cms4s0e6s000uwgcnyxqshukf	ASSIGNMENT_RETURN	\N	2026-07-29 03:57:36.815	cms5hi51x0001a4cnbqnfsazm	Assignment	ASSIGNMENT	{"status": "RETURNED", "returnedById": "cms4s0e6s000uwgcnyxqshukf"}	{"status": "ACTIVE"}	USER	SUCCESS	\N
cms5k5xu7000b7kcnl259rlgn	cms4s0e6s000uwgcnyxqshukf	MAINTENANCE_COMPLETE	\N	2026-07-29 04:01:55.855	cms5ht5690007a4cnddh4qzkj	Maintenance	MAINTENANCE	{"status": "COMPLETED", "actualCost": "250"}	{"status": "IN_PROGRESS"}	USER	SUCCESS	\N
cms5kq7ew000144cnuojkkevn	cms4s0e6s000uwgcnyxqshukf	SUPPLIER_CREATE	\N	2026-07-29 04:17:41.384	cms5kq7er000044cnll886sjq	Supplier	SUPPLIER	{"code": "NGC-MAD", "name": "Maddix Tech", "status": "ACTIVE"}	null	USER	SUCCESS	\N
cms5kxqvd000290cn52w3noz6	cms4s0e6s000uwgcnyxqshukf	PROCUREMENT_APPROVE	\N	2026-07-29 04:23:33.193	cms5kxij2000090cnay49x72a	Procurement	PROCUREMENT	{"status": "APPROVED"}	{"status": "DRAFT"}	USER	SUCCESS	\N
cms5ky0jc000790cncq8xcrpy	cms4s0e6s000uwgcnyxqshukf	PROCUREMENT_RECEIVE	\N	2026-07-29 04:23:45.72	cms5kxij2000090cnay49x72a	Procurement	PROCUREMENT	{"status": "RECEIVED"}	{"status": "APPROVED"}	USER	SUCCESS	\N
cms5mcp7l0000zscnmbvknzbb	cms4s0e6s000uwgcnyxqshukf	CONFIG_CREATE	\N	2026-07-29 05:03:10.497	LOW_STOCK_THRESHOLD	SystemConfig	SYSTEM_CONFIG	{"value": "10", "description": "Inventory considered low below this quantity"}	null	USER	SUCCESS	\N
cms5n4bmj0004zscnau64u8nz	cms4s0e6s000uwgcnyxqshukf	ASSIGNMENT_CREATE	\N	2026-07-29 05:24:39.259	cms5n4bi10002zscnwyq215u3	Assignment	ASSIGNMENT	{"baseId": "cms4ssnl30010wgcn57ig7zgx", "assignedTo": "Officer", "equipmentAssetId": "cms5ky0ik000490cnj2nuicai"}	null	USER	SUCCESS	\N
cms5p6xnn0001kwcnxpfynu2v	cms4s0e6s000uwgcnyxqshukf	TRANSFER_CREATE	\N	2026-07-29 06:22:40.355	cms5p6xma0000kwcnr6kvq2u6	Transfer	TRANSFER	{"status": "PENDING", "toBaseId": "cms29c8i00000rgcnffhb07zo", "fromBaseId": "cms4ssnl30010wgcn57ig7zgx", "equipmentAssetId": "cms5ghtm800062kcnktxseaec"}	null	USER	SUCCESS	\N
cms5p74q50003kwcng9gu13m4	cms4s0e6s000uwgcnyxqshukf	TRANSFER_APPROVE	\N	2026-07-29 06:22:49.517	cms5p6xma0000kwcnr6kvq2u6	Transfer	TRANSFER	{"status": "APPROVED"}	{"status": "PENDING"}	USER	SUCCESS	\N
cms5p77cb0007kwcnbp2loemk	cms4s0e6s000uwgcnyxqshukf	TRANSFER_DISPATCH	\N	2026-07-29 06:22:52.907	cms5p6xma0000kwcnr6kvq2u6	Transfer	TRANSFER	{"status": "IN_TRANSIT"}	{"status": "APPROVED"}	USER	SUCCESS	\N
cms5rn6w300004scnexx2q2ka	cms4s0e6s000uwgcnyxqshukf	USER_LOGIN	::1	2026-07-29 07:31:18.051	cms4s0e6s000uwgcnyxqshukf	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms5rnqda00024scn6r2ekyti	cms4s0e6s000uwgcnyxqshukf	ORG_UNIT_CREATE	\N	2026-07-29 07:31:43.294	cms5rnqd800014scn84a5rm5t	OrganizationUnit	ORGANIZATION_UNIT	{"code": "ARMY-01", "name": "Army", "level": "COMMAND", "parentId": null}	null	USER	SUCCESS	\N
cms5roevc00044scndbzoifwc	cms4s0e6s000uwgcnyxqshukf	ORG_UNIT_CREATE	\N	2026-07-29 07:32:15.048	cms5roeva00034scnmjt7bcsl	OrganizationUnit	ORGANIZATION_UNIT	{"code": "NC-01", "name": "Northern Command", "level": "DIVISION", "parentId": "cms5rnqd800014scn84a5rm5t"}	null	USER	SUCCESS	\N
cms5rous200064scn1m76btre	cms4s0e6s000uwgcnyxqshukf	ORG_UNIT_CREATE	\N	2026-07-29 07:32:35.666	cms5rous100054scn2wn27pwh	OrganizationUnit	ORGANIZATION_UNIT	{"code": "SC-01", "name": "Southern Command", "level": "DIVISION", "parentId": "cms5rnqd800014scn84a5rm5t"}	null	USER	SUCCESS	\N
cms5rpdkh00084scn363w61vp	cms4s0e6s000uwgcnyxqshukf	ORG_UNIT_CREATE	\N	2026-07-29 07:33:00.017	cms5rpdkf00074scn2dxrxixk	OrganizationUnit	ORGANIZATION_UNIT	{"code": "EC-01", "name": "Eastern Command", "level": "DIVISION", "parentId": "cms5rnqd800014scn84a5rm5t"}	null	USER	SUCCESS	\N
cms5rq4ie000a4scnn9xoi6d0	cms4s0e6s000uwgcnyxqshukf	BASE_CREATE	\N	2026-07-29 07:33:34.934	cms5rq4ic00094scnuxune2bu	Base	BASE	{"code": "FA-01", "name": "Fort Alpha", "location": "Alpha"}	null	USER	SUCCESS	\N
cms5rt5y9000d4scnu4s8ij8d	cms4s0e6s000uwgcnyxqshukf	BASE_CREATE	\N	2026-07-29 07:35:56.769	cms5rt5y7000c4scnnee0voy5	Base	BASE	{"code": "FB-01", "name": "Fort Bravo", "location": "Bravo"}	null	USER	SUCCESS	\N
cms5rtjjo000g4scnbq4o89fa	cms4s0e6s000uwgcnyxqshukf	BASE_CREATE	\N	2026-07-29 07:36:14.388	cms5rtjjm000f4scn6d0ho2zo	Base	BASE	{"code": "FC-01", "name": "Fort Charlie", "location": "Charlie"}	null	USER	SUCCESS	\N
cms5ru8k5000i4scnuq7n7b43	cms4s0e6s000uwgcnyxqshukf	USER_UPDATE	\N	2026-07-29 07:36:46.805	cms4iqilr000088cnopgis8av	User	USER	{"name": "Col. Reeves", "role": "BASE_COMMANDER", "email": "alexander.reeves@military.gov", "baseId": "cms5rt5y7000c4scnnee0voy5", "status": "ACTIVE"}	{"name": "Col. Reeves", "role": "BASE_COMMANDER", "email": "alexander.reeves@military.gov", "baseId": "cms4ssnl30010wgcn57ig7zgx", "status": "ACTIVE"}	USER	SUCCESS	\N
cms5rur11000l4scngj1s7z0e	cms4s0e6s000uwgcnyxqshukf	USER_CREATE	\N	2026-07-29 07:37:10.741	cms5rur0z000k4scn111m3cx1	User	USER	{"name": "Miller", "role": "BASE_COMMANDER", "email": "miller@gmail.com", "baseId": "cms5rq4ic00094scnuxune2bu"}	null	USER	SUCCESS	\N
cms5rv3xa000n4scnjh4ee1l3	cms4s0e6s000uwgcnyxqshukf	USER_UPDATE	\N	2026-07-29 07:37:27.454	cms4iqim9000188cnwzfnlda5	User	USER	{"name": "Maj. Chen", "role": "LOGISTICS_OFFICER", "email": "wei.chen@military.gov", "baseId": "cms5rq4ic00094scnuxune2bu", "status": "ACTIVE"}	{"name": "Maj. Chen", "role": "LOGISTICS_OFFICER", "email": "wei.chen@military.gov", "baseId": "cms29c8i00000rgcnffhb07zo", "status": "ACTIVE"}	USER	SUCCESS	\N
cms5rxbmj000q4scnj7dga4zr	cms4s0e6s000uwgcnyxqshukf	SUPPLIER_CREATE	\N	2026-07-29 07:39:10.747	cms5rxbmi000p4scn95tucroh	Supplier	SUPPLIER	{"code": "EGT-01", "name": "East Group Tech", "status": "ACTIVE"}	null	USER	SUCCESS	\N
cms5ry3g2000t4scn5acpv7qf	cms4s0e6s000uwgcnyxqshukf	SUPPLIER_CREATE	\N	2026-07-29 07:39:46.802	cms5ry3g1000s4scn8vueu77v	Supplier	SUPPLIER	{"code": "BLT-01", "name": "Boeing Logistic Tech", "status": "ACTIVE"}	null	USER	SUCCESS	\N
cms5ryzcs000w4scnlyrgzb2z	cms4s0e6s000uwgcnyxqshukf	SUPPLIER_CREATE	\N	2026-07-29 07:40:28.156	cms5ryzcr000v4scnmeu4zvkm	Supplier	SUPPLIER	{"code": "GDT-01", "name": "General Dynamics Tech", "status": "ACTIVE"}	null	USER	SUCCESS	\N
cms5rzm1w000y4scnalvty0do	cms4s0e6s000uwgcnyxqshukf	USER_LOGIN	::1	2026-07-29 07:40:57.572	cms4s0e6s000uwgcnyxqshukf	User	AUTH	null	null	USER	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
cms5sc0qx0001twcnuokod76t	cms4s0e6s000uwgcnyxqshukf	EQUIPMENT_CREATE	\N	2026-07-29 07:50:36.489	cms5sc0qn0000twcnkfe86jmt	Equipment	EQUIPMENT	{"name": "M4 Carbine", "unit": "NOS", "model": "MC-04", "category": "WEAPON", "supplierId": "cms5kq7er000044cnll886sjq"}	null	USER	SUCCESS	\N
cms5sch1z0004twcnum0yudsf	cms4s0e6s000uwgcnyxqshukf	EQUIPMENT_CREATE	\N	2026-07-29 07:50:57.623	cms5sch1t0003twcnjxnj8jba	Equipment	EQUIPMENT	{"name": "Tank", "unit": "NOS", "model": "TV-01", "category": "VEHICLE", "supplierId": "cms5ry3g1000s4scn8vueu77v"}	null	USER	SUCCESS	\N
cms5scw6z0007twcnu3sr7mhp	cms4s0e6s000uwgcnyxqshukf	EQUIPMENT_CREATE	\N	2026-07-29 07:51:17.243	cms5scw6v0006twcngulad9q3	Equipment	EQUIPMENT	{"name": "Jeep", "unit": "NOS", "model": "JV-01", "category": "VEHICLE", "supplierId": "cms5ry3g1000s4scn8vueu77v"}	null	USER	SUCCESS	\N
cms5sdhw0000atwcnk88ib15g	cms4s0e6s000uwgcnyxqshukf	EQUIPMENT_CREATE	\N	2026-07-29 07:51:45.36	cms5sdhvu0009twcnbm5bn28h	Equipment	EQUIPMENT	{"name": "Night Vision Goggles", "unit": "NOS", "model": "NVG-01", "category": "OTHER", "supplierId": "cms5ryzcr000v4scnmeu4zvkm"}	null	USER	SUCCESS	\N
cms5se0e3000dtwcnfwt6dnyy	cms4s0e6s000uwgcnyxqshukf	EQUIPMENT_CREATE	\N	2026-07-29 07:52:09.339	cms5se0dz000ctwcn85x5hy3d	Equipment	EQUIPMENT	{"name": "5.56 Ammo", "unit": "NOS", "model": "AMMO-5", "category": "WEAPON", "supplierId": "cms5kq7er000044cnll886sjq"}	null	USER	SUCCESS	\N
cms5sefa2000gtwcnx4aywfdz	cms4s0e6s000uwgcnyxqshukf	EQUIPMENT_CREATE	\N	2026-07-29 07:52:28.634	cms5sef9z000ftwcnuw0q8ivl	Equipment	EQUIPMENT	{"name": "Radio", "unit": "NOS", "model": "RS-01", "category": "OTHER", "supplierId": "cms5rxbmi000p4scn95tucroh"}	null	USER	SUCCESS	\N
cms5smlvk000628cnl7varzin	cms4s0e6s000uwgcnyxqshukf	PROCUREMENT_APPROVE	\N	2026-07-29 07:58:50.432	cms5smjwo000428cn8lyu2j63	Procurement	PROCUREMENT	{"status": "APPROVED"}	{"status": "DRAFT"}	USER	SUCCESS	\N
cms5smn0q000828cnj2nh7s1j	cms4s0e6s000uwgcnyxqshukf	PROCUREMENT_APPROVE	\N	2026-07-29 07:58:51.914	cms5sm2c8000228cnpt0f57gm	Procurement	PROCUREMENT	{"status": "APPROVED"}	{"status": "DRAFT"}	USER	SUCCESS	\N
cms5smnt9000a28cne52sqctg	cms4s0e6s000uwgcnyxqshukf	PROCUREMENT_APPROVE	\N	2026-07-29 07:58:52.941	cms5sl5au000028cni8z2dro2	Procurement	PROCUREMENT	{"status": "APPROVED"}	{"status": "DRAFT"}	USER	SUCCESS	\N
cms5sok2a000x28cnaph2zsic	cms4s0e6s000uwgcnyxqshukf	PROCUREMENT_RECEIVE	\N	2026-07-29 08:00:21.394	cms5smjwo000428cn8lyu2j63	Procurement	PROCUREMENT	{"status": "RECEIVED"}	{"status": "APPROVED"}	USER	SUCCESS	\N
cms5sqrto001128cncsi0t8f0	cms4s0e6s000uwgcnyxqshukf	ASSIGNMENT_RETURN	\N	2026-07-29 08:02:04.765	cms5n4bi10002zscnwyq215u3	Assignment	ASSIGNMENT	{"status": "RETURNED", "returnedById": "cms4s0e6s000uwgcnyxqshukf"}	{"status": "ACTIVE"}	USER	SUCCESS	\N
cms5ss0vc001428cn27wt61lp	cms4s0e6s000uwgcnyxqshukf	PERSONNEL_CREATE	\N	2026-07-29 08:03:03.144	cms5ss0v8001328cngoyn3y68	Personnel	PERSONNEL	{"name": "Dhanush Srinivas", "rank": "Maj.", "status": "ACTIVE", "serviceNumber": "12211647"}	null	USER	SUCCESS	\N
cms5su2rh001628cnrdb47zor	cms4s0e6s000uwgcnyxqshukf	TRANSFER_CREATE	\N	2026-07-29 08:04:38.909	cms5su2qc001528cnjgmzekoo	Transfer	TRANSFER	{"status": "PENDING", "toBaseId": "cms5rt5y7000c4scnnee0voy5", "fromBaseId": "cms5rq4ic00094scnuxune2bu", "equipmentAssetId": "cms5sok1m000o28cnn3k5h34p"}	null	USER	SUCCESS	\N
cms5sucac001928cnjezr7bb2	cms4s0e6s000uwgcnyxqshukf	MAINTENANCE_SCHEDULE	\N	2026-07-29 08:04:51.252	cms5suc9b001828cnzplrojpn	Maintenance	MAINTENANCE	{"scheduledDate": "2026-07-29T00:00:00.000Z", "maintenanceType": "PREVENTIVE", "equipmentAssetId": "cms5sok1i000k28cnnpxovfy7", "expectedCompletionDate": null}	null	USER	SUCCESS	\N
cms5sy8ch001b28cnsho7e0ru	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-29 08:07:52.769	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms5szppq001c28cntak62mar	cms28x4pl0000lgcnv6qv5pc7	FAILED_LOGIN	::1	2026-07-29 08:09:01.934	cms28x4pl0000lgcnv6qv5pc7	User	AUTH	{"email": "admin@military.gov"}	null	USER	FAILURE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
cms5t3kp0001e28cn15jhwpso	cms4s0e6s000uwgcnyxqshukf	INSPECTION_SCHEDULE	\N	2026-07-29 08:12:02.052	cms5t3kor001d28cnlpkcomf6	Inspection	INSPECTION	{"scheduledDate": "2026-07-29T08:12:01.991Z", "equipmentAssetId": "cms5sok1q000u28cnw09nl7e3"}	null	USER	SUCCESS	\N
cms5t3krl001g28cn0e7n43uj	cms4s0e6s000uwgcnyxqshukf	INSPECTION_COMPLETE	\N	2026-07-29 08:12:02.145	cms5t3kor001d28cnlpkcomf6	Inspection	INSPECTION	{"result": "PASS", "completedDate": "2026-07-29T08:12:02.086Z"}	{"result": "PENDING"}	USER	SUCCESS	\N
cms5t3rte001l28cnowrzypep	cms4s0e6s000uwgcnyxqshukf	ASSIGNMENT_CREATE	\N	2026-07-29 08:12:11.282	cms5t3rpx001j28cnlxl74jov	Assignment	ASSIGNMENT	{"baseId": "cms5rq4ic00094scnuxune2bu", "assignedTo": "Maj. Dhanush Srinivas", "equipmentAssetId": "cms5sok0u000c28cny5s1ok74"}	null	USER	SUCCESS	\N
cms5t4lme001o28cnebjknxsa	cms4s0e6s000uwgcnyxqshukf	INSPECTION_SCHEDULE	\N	2026-07-29 08:12:49.91	cms5t4lmb001n28cnc008qr8u	Inspection	INSPECTION	{"scheduledDate": "2026-07-29T08:12:49.867Z", "equipmentAssetId": "cms5sok1h000i28cn25xbn533"}	null	USER	SUCCESS	\N
cms5t4lnq001q28cndendvofl	cms4s0e6s000uwgcnyxqshukf	INSPECTION_COMPLETE	\N	2026-07-29 08:12:49.958	cms5t4lmb001n28cnc008qr8u	Inspection	INSPECTION	{"result": "PASS", "completedDate": "2026-07-29T08:12:49.917Z"}	{"result": "PENDING"}	USER	SUCCESS	\N
cms5t5bn7001t28cnozqtkeb4	cms4s0e6s000uwgcnyxqshukf	INSPECTION_SCHEDULE	\N	2026-07-29 08:13:23.635	cms5t5bn5001s28cnegky8zzj	Inspection	INSPECTION	{"scheduledDate": "2026-07-29T00:00:00.000Z", "equipmentAssetId": "cms5jceml000pa4cndkf1u97g"}	null	USER	SUCCESS	\N
\.


--
-- Data for Name: Base; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Base" (id, name, location, "createdAt", "updatedAt", code, "isActive") FROM stdin;
cms29c8i00000rgcnffhb07zo	Forward Operating Base Bravo Updated	Sector 7	2026-07-26 20:35:35.304	2026-07-26 20:42:02.223	FOB-ALPHA02	t
cms28zhvn0000t8cnfimpr1e0	Forward Operating Base Alpha (Updated)	Sector 4	2026-07-26 20:25:40.931	2026-07-26 20:26:34.23	FOB-ALPHA01	t
cms4ssnl30010wgcn57ig7zgx	Camp Vanguard	Mumbai	2026-07-28 15:15:46.407	2026-07-28 15:15:46.407	CAMP-VANGUARD	t
cms29lwyl0001rgcnobscjdxp	Forward Operating Base Charlie	Sector 9	2026-07-26 20:43:06.909	2026-07-28 15:16:55.059	FOB-ALPHA03	f
cms5rq4ic00094scnuxune2bu	Fort Alpha	Alpha	2026-07-29 07:33:34.932	2026-07-29 07:33:34.932	FA-01	t
cms5rt5y7000c4scnnee0voy5	Fort Bravo	Bravo	2026-07-29 07:35:56.767	2026-07-29 07:35:56.767	FB-01	t
cms5rtjjm000f4scn6d0ho2zo	Fort Charlie	Charlie	2026-07-29 07:36:14.386	2026-07-29 07:36:14.386	FC-01	t
\.


--
-- Data for Name: CronJobLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CronJobLog" (id, "jobName", "startedAt", "completedAt", status, error) FROM stdin;
\.


--
-- Data for Name: DepreciationHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DepreciationHistory" (id, "equipmentAssetId", date, amount, "previousBookValue", "newBookValue", "createdAt") FROM stdin;
\.


--
-- Data for Name: Disposal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Disposal" (id, "equipmentAssetId", "disposalReason", status, remarks, "approvedById", "disposedById", "disposalDate", "bookValue", "createdAt", "updatedAt") FROM stdin;
cms4vna65000j0wcnd0dvlce2	cms4vna3a00030wcnttrardsf	SCRAPPED	APPROVED	Structural fatigue beyond repair	\N	\N	\N	\N	2026-07-28 16:35:34.589	2026-07-28 16:35:34.599
\.


--
-- Data for Name: Equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Equipment" (id, name, category, unit, description, "createdAt", "updatedAt", "expectedLifeYears", "isActive", model, specifications, "supplierId") FROM stdin;
cms2wwsnn00008scnk0qv9ev4	INSAS Rifle	WEAPON	NOS	Standard issue infantry rifle	2026-07-27 07:35:25.715	2026-07-27 07:35:25.715	20	t	INSAS 1B1	5.56×45mm NATO	\N
cms2wxlb600018scn37pmxlpq	INSAS Rifle	WEAPON	NOS	Standard issue infantry rifle	2026-07-27 07:36:02.85	2026-07-27 08:03:11.821	25	f	INSAS 1B1	5.56×45mm NATO	\N
cms4t4oii0019wgcn19g06abw	Med-Kit	MEDICAL	NOS	\N	2026-07-28 15:25:07.482	2026-07-28 15:25:07.482	10	t	Medical-Kit-01	\N	\N
cms37jjpt0002wocnafie3uto	Test Rifle M416	WEAPON	NOS	Standard issue test weapon	2026-07-27 12:33:03.377	2026-07-28 15:30:00.886	15	t	M416	5.56mm caliber	\N
cms5sc0qn0000twcnkfe86jmt	M4 Carbine	WEAPON	NOS	\N	2026-07-29 07:50:36.479	2026-07-29 07:50:36.479	10	t	MC-04	\N	cms5kq7er000044cnll886sjq
cms5sch1t0003twcnjxnj8jba	Tank	VEHICLE	NOS	\N	2026-07-29 07:50:57.617	2026-07-29 07:50:57.617	10	t	TV-01	\N	cms5ry3g1000s4scn8vueu77v
cms5scw6v0006twcngulad9q3	Jeep	VEHICLE	NOS	\N	2026-07-29 07:51:17.239	2026-07-29 07:51:17.239	10	t	JV-01	\N	cms5ry3g1000s4scn8vueu77v
cms5sdhvu0009twcnbm5bn28h	Night Vision Goggles	OTHER	NOS	\N	2026-07-29 07:51:45.354	2026-07-29 07:51:45.354	10	t	NVG-01	\N	cms5ryzcr000v4scnmeu4zvkm
cms5se0dz000ctwcn85x5hy3d	5.56 Ammo	WEAPON	NOS	\N	2026-07-29 07:52:09.335	2026-07-29 07:52:09.335	10	t	AMMO-5	\N	cms5kq7er000044cnll886sjq
cms5sef9z000ftwcnuw0q8ivl	Radio	OTHER	NOS	\N	2026-07-29 07:52:28.631	2026-07-29 07:52:28.631	10	t	RS-01	\N	cms5rxbmi000p4scn95tucroh
\.


--
-- Data for Name: EquipmentAsset; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EquipmentAsset" (id, "equipmentId", "baseId", "serialNumber", "purchaseDate", "purchaseCost", status, condition, remarks, "isActive", "createdAt", "updatedAt", "qrCodeUrl", "unitId") FROM stdin;
cms2y714t0002wgcnzgd2hvla	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	INSAS-000002	2026-07-27 00:00:00	55000.000000000000000000000000000000	AVAILABLE	NEW	\N	f	2026-07-27 08:11:22.877	2026-07-27 08:15:57.794	\N	\N
cms4u9ddu0000xscnwiwlail0	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	TEST-SR-1785254205946	2026-07-28 15:56:45.946	75000.000000000000000000000000000000	AVAILABLE	NEW	\N	t	2026-07-28 15:56:45.954	2026-07-28 15:56:45.954	\N	\N
cms4vlo1x0004v0cn31zdacor	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	SN-B-1785256459263	2026-07-28 16:34:19.227	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-459227	t	2026-07-28 16:34:19.269	2026-07-28 16:34:19.269	\N	\N
cms4vlo1x0003v0cnu13gmkf2	cms2wwsnn00008scnk0qv9ev4	cms28zhvn0000t8cnfimpr1e0	SN-A-1785256459263	2026-07-28 16:34:19.227	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-459227	t	2026-07-28 16:34:19.269	2026-07-28 16:34:19.353	\N	\N
cms4vlvne0004a0cnlo1gy004	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	SN-B-1785256469105	2026-07-28 16:34:29.08	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-469080	t	2026-07-28 16:34:29.114	2026-07-28 16:34:29.114	\N	\N
cms4vlvne0003a0cnvsvtsnwt	cms2wwsnn00008scnk0qv9ev4	cms28zhvn0000t8cnfimpr1e0	SN-A-1785256469105	2026-07-28 16:34:29.08	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-469080	t	2026-07-28 16:34:29.114	2026-07-28 16:34:29.183	\N	\N
cms4vm30s0004dccnavt9cu7s	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	SN-B-1785256478660	2026-07-28 16:34:38.622	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-478622	t	2026-07-28 16:34:38.668	2026-07-28 16:34:38.668	\N	\N
cms4vm30s0003dccnpsnqxpnk	cms2wwsnn00008scnk0qv9ev4	cms28zhvn0000t8cnfimpr1e0	SN-A-1785256478660	2026-07-28 16:34:38.622	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-478622	t	2026-07-28 16:34:38.668	2026-07-28 16:34:38.743	\N	\N
cms4vm9ml000400cnm95ulz3x	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	SN-B-1785256487220	2026-07-28 16:34:47.194	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-487194	t	2026-07-28 16:34:47.229	2026-07-28 16:34:47.229	\N	\N
cms4vm9ml000300cnv5qw95vc	cms2wwsnn00008scnk0qv9ev4	cms28zhvn0000t8cnfimpr1e0	SN-A-1785256487220	2026-07-28 16:34:47.194	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-487194	t	2026-07-28 16:34:47.229	2026-07-28 16:34:47.306	\N	\N
cms4vmkti0004mwcnou0n9uhn	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	SN-B-1785256501725	2026-07-28 16:35:01.699	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-501699	t	2026-07-28 16:35:01.734	2026-07-28 16:35:01.734	\N	\N
cms4vmkti0003mwcnfeg784dy	cms2wwsnn00008scnk0qv9ev4	cms28zhvn0000t8cnfimpr1e0	SN-A-1785256501725	2026-07-28 16:35:01.699	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-501699	t	2026-07-28 16:35:01.734	2026-07-28 16:35:01.806	\N	\N
cms4vmsme0004aocneu1w72ti	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	SN-B-1785256511829	2026-07-28 16:35:11.778	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-511777	t	2026-07-28 16:35:11.846	2026-07-28 16:35:11.846	\N	\N
cms4vmsme0003aocnnxd4bshu	cms2wwsnn00008scnk0qv9ev4	cms28zhvn0000t8cnfimpr1e0	SN-A-1785256511829	2026-07-28 16:35:11.778	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-511777	t	2026-07-28 16:35:11.846	2026-07-28 16:35:11.978	\N	\N
cms4vna3a00040wcn63tyhh5f	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	SN-B-1785256534478	2026-07-28 16:35:34.451	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-534451	t	2026-07-28 16:35:34.486	2026-07-28 16:35:34.486	\N	\N
cms4vna3a00030wcnttrardsf	cms2wwsnn00008scnk0qv9ev4	cms28zhvn0000t8cnfimpr1e0	SN-A-1785256534478	2026-07-28 16:35:34.451	90000.000000000000000000000000000000	AVAILABLE	NEW	Procured under PO PO-534451	t	2026-07-28 16:35:34.486	2026-07-28 16:35:34.568	\N	\N
cms2y1vg90000wgcngnm36l7i	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	INSAS-000001	\N	55000.000000000000000000000000000000	ASSIGNED	NEW	\N	f	2026-07-27 08:07:22.233	2026-07-29 03:36:28.792	\N	\N
cms4u8vgy00008ccnnjdn7gj7	cms2wwsnn00008scnk0qv9ev4	cms29c8i00000rgcnffhb07zo	TEST-SR-1785254182730	2026-07-28 15:56:22.73	75000.000000000000000000000000000000	AVAILABLE	NEW	\N	f	2026-07-28 15:56:22.738	2026-07-29 03:36:33.701	\N	\N
cms5jceml000pa4cndkf1u97g	cms37jjpt0002wocnafie3uto	cms4ssnl30010wgcn57ig7zgx	M416-A2	2026-07-29 00:00:00	1000.000000000000000000000000000000	AVAILABLE	GOOD	\N	t	2026-07-29 03:38:57.933	2026-07-29 03:38:57.933	\N	\N
cms5gg7kf00032kcnrk6v910r	cms4t4oii0019wgcn19g06abw	cms4ssnl30010wgcn57ig7zgx	12211645	2026-07-29 00:00:00	10.000000000000000000000000000000	AVAILABLE	NEW	Medical kit for army	t	2026-07-29 02:17:56.559	2026-07-29 03:53:01.898	\N	\N
cms5hkl3e0005a4cnwmn4k2g5	cms37jjpt0002wocnafie3uto	cms4ssnl30010wgcn57ig7zgx	M416-A1	2026-07-29 00:00:00	1000.000000000000000000000000000000	AVAILABLE	GOOD	\N	f	2026-07-29 02:49:20.33	2026-07-29 04:24:46.4	\N	\N
cms5ghtm800062kcnktxseaec	cms4t4oii0019wgcn19g06abw	cms4ssnl30010wgcn57ig7zgx	12211646	2026-07-29 00:00:00	10.000000000000000000000000000000	IN_TRANSIT	NEW	Medical kit for army	t	2026-07-29 02:19:11.792	2026-07-29 06:22:52.892	\N	\N
cms5sok1e000e28cnvw4ekv4g	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP2	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.362	2026-07-29 08:00:21.362	\N	\N
cms5sok1g000g28cnlbrbo4ll	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP3	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.364	2026-07-29 08:00:21.364	\N	\N
cms5sok1h000i28cn25xbn533	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP4	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.365	2026-07-29 08:00:21.365	\N	\N
cms5sok1i000k28cnnpxovfy7	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP5	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.366	2026-07-29 08:00:21.366	\N	\N
cms5sok1k000m28cn0iwf78zj	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP6	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.368	2026-07-29 08:00:21.368	\N	\N
cms5sok1m000o28cnn3k5h34p	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP7	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.37	2026-07-29 08:00:21.37	\N	\N
cms5sok1n000q28cnwpj18t7l	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP8	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.371	2026-07-29 08:00:21.371	\N	\N
cms5sok1o000s28cnvvzptm7u	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP9	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.372	2026-07-29 08:00:21.372	\N	\N
cms5sok1q000u28cnw09nl7e3	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP10	2026-07-29 00:00:00	10000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.374	2026-07-29 08:00:21.374	\N	\N
cms5ky0ik000490cnj2nuicai	cms37jjpt0002wocnafie3uto	cms4ssnl30010wgcn57ig7zgx	123455	2026-07-29 00:00:00	1000.000000000000000000000000000000	AVAILABLE	NEW	Procured under ref PO-894998	t	2026-07-29 04:23:45.692	2026-07-29 08:02:04.753	\N	\N
cms5sok0u000c28cny5s1ok74	cms5scw6v0006twcngulad9q3	cms5rq4ic00094scnuxune2bu	JP1	2026-07-29 00:00:00	10000.000000000000000000000000000000	ASSIGNED	NEW	Procured under ref PO-907282	t	2026-07-29 08:00:21.342	2026-07-29 08:12:11.145	\N	\N
\.


--
-- Data for Name: Expenditure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Expenditure" (id, "baseId", quantity, reason, "expendedById", remarks, "expendedAt", "createdAt", "updatedAt", "equipmentAssetId") FROM stdin;
\.


--
-- Data for Name: Inspection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Inspection" (id, "equipmentAssetId", "scheduledDate", "completedDate", "inspectorId", result, remarks, "createdAt", "updatedAt") FROM stdin;
cms4vmsqe000haocnm9w65kfm	cms4vmsme0003aocnnxd4bshu	2026-07-28 16:35:11.987	2026-07-28 16:35:11.999	cms4s0e6s000uwgcnyxqshukf	PASS	System cleared with zero safety failures.	2026-07-28 16:35:11.991	2026-07-28 16:35:12
cms4vna5s000h0wcnl7d35l9d	cms4vna3a00030wcnttrardsf	2026-07-28 16:35:34.574	2026-07-28 16:35:34.581	cms4s0e6s000uwgcnyxqshukf	PASS	System cleared with zero safety failures.	2026-07-28 16:35:34.576	2026-07-28 16:35:34.582
cms5jjj00000ra4cng83ky6c2	cms5jceml000pa4cndkf1u97g	2026-07-29 03:44:30.137	2026-07-29 03:48:54.648	cms4s0e6s000uwgcnyxqshukf	PASS	\N	2026-07-29 03:44:30.192	2026-07-29 03:48:54.653
cms5t3kor001d28cnlpkcomf6	cms5sok1q000u28cnw09nl7e3	2026-07-29 08:12:01.991	2026-07-29 08:12:02.086	cms4s0e6s000uwgcnyxqshukf	PASS		2026-07-29 08:12:02.043	2026-07-29 08:12:02.139
cms5t4lmb001n28cnc008qr8u	cms5sok1h000i28cn25xbn533	2026-07-29 08:12:49.867	2026-07-29 08:12:49.917	cms4s0e6s000uwgcnyxqshukf	PASS		2026-07-29 08:12:49.907	2026-07-29 08:12:49.955
cms5t5bn5001s28cnegky8zzj	cms5jceml000pa4cndkf1u97g	2026-07-29 00:00:00	\N	cms4s0e6s000uwgcnyxqshukf	PENDING	Working good	2026-07-29 08:13:23.633	2026-07-29 08:13:23.633
\.


--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Inventory" (id, "baseId", "equipmentId", quantity, "createdAt", "updatedAt", "availableQuantity", "damagedQuantity", "isActive", "maintenanceQuantity", "minimumStock", remarks, "allocatedQuantity", "inTransitQuantity") FROM stdin;
cms2y1vgh0001wgcnvo7ugzuz	cms29c8i00000rgcnffhb07zo	cms2wwsnn00008scnk0qv9ev4	8	2026-07-27 08:07:22.241	2026-07-29 03:36:33.703	8	0	t	0	0	\N	0	0
cms5gg7ky00042kcnk0gmans9	cms29c8i00000rgcnffhb07zo	cms4t4oii0019wgcn19g06abw	0	2026-07-29 02:17:56.578	2026-07-29 03:53:01.912	0	0	t	0	0	\N	0	0
cms5ghtmb00072kcnby12w81d	cms4ssnl30010wgcn57ig7zgx	cms4t4oii0019wgcn19g06abw	2	2026-07-29 02:19:11.795	2026-07-29 06:22:52.902	1	0	t	0	0	\N	0	1
cms5hkl3j0006a4cnpfscmu0n	cms4ssnl30010wgcn57ig7zgx	cms37jjpt0002wocnafie3uto	2	2026-07-29 02:49:20.335	2026-07-29 08:02:04.76	2	0	t	0	0	\N	0	0
cms5sok24000w28cndd8y5b80	cms5rq4ic00094scnuxune2bu	cms5scw6v0006twcngulad9q3	10	2026-07-29 08:00:21.388	2026-07-29 08:12:11.165	9	0	t	0	0	\N	1	0
cms4vlo2q0007v0cnqqza2enr	cms28zhvn0000t8cnfimpr1e0	cms2wwsnn00008scnk0qv9ev4	7	2026-07-28 16:34:19.298	2026-07-28 16:35:43.077	7	0	t	0	0	\N	0	0
\.


--
-- Data for Name: Ledger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Ledger" (id, "baseId", "movementType", quantity, "referenceType", "purchaseId", "transferId", "assignmentId", "expenditureId", "createdById", remarks, "createdAt", "equipmentAssetId") FROM stdin;
\.


--
-- Data for Name: Maintenance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Maintenance" (id, "equipmentAssetId", "maintenanceType", status, description, "scheduledDate", "expectedCompletionDate", "startedAt", "completedAt", "vendorName", "technicianName", "estimatedCost", "actualCost", remarks, "createdById", "completedById", "isActive", "createdAt", "updatedAt") FROM stdin;
cms4vlo3p000ev0cnica87979	cms4vlo1x0003v0cnu13gmkf2	CORRECTIVE	COMPLETED	Repair hydraulic pressure leak	2026-07-28 16:34:19.332	\N	2026-07-28 16:34:19.341	2026-07-28 16:34:19.351	\N	\N	\N	\N	\N	cms4s0e6s000uwgcnyxqshukf	\N	t	2026-07-28 16:34:19.333	2026-07-28 16:34:19.352
cms4vlvot000ea0cnrwrm5w1z	cms4vlvne0003a0cnvsvtsnwt	CORRECTIVE	COMPLETED	Repair hydraulic pressure leak	2026-07-28 16:34:29.164	\N	2026-07-28 16:34:29.168	2026-07-28 16:34:29.18	\N	\N	\N	\N	\N	cms4s0e6s000uwgcnyxqshukf	\N	t	2026-07-28 16:34:29.165	2026-07-28 16:34:29.181
cms4vm32e000edccnkpi38cwi	cms4vm30s0003dccnpsnqxpnk	CORRECTIVE	COMPLETED	Repair hydraulic pressure leak	2026-07-28 16:34:38.725	\N	2026-07-28 16:34:38.729	2026-07-28 16:34:38.74	\N	\N	\N	\N	\N	cms4s0e6s000uwgcnyxqshukf	\N	t	2026-07-28 16:34:38.726	2026-07-28 16:34:38.741
cms4vm9o6000e00cn5nzv1a4l	cms4vm9ml000300cnv5qw95vc	CORRECTIVE	COMPLETED	Repair hydraulic pressure leak	2026-07-28 16:34:47.285	\N	2026-07-28 16:34:47.29	2026-07-28 16:34:47.304	\N	\N	\N	\N	\N	cms4s0e6s000uwgcnyxqshukf	\N	t	2026-07-28 16:34:47.286	2026-07-28 16:34:47.305
cms4vmkv1000emwcn3v804hbm	cms4vmkti0003mwcnfeg784dy	CORRECTIVE	COMPLETED	Repair hydraulic pressure leak	2026-07-28 16:35:01.788	\N	2026-07-28 16:35:01.793	2026-07-28 16:35:01.804	\N	\N	\N	\N	\N	cms4s0e6s000uwgcnyxqshukf	\N	t	2026-07-28 16:35:01.789	2026-07-28 16:35:01.805
cms4vmsp6000eaocnew6bdqww	cms4vmsme0003aocnnxd4bshu	CORRECTIVE	COMPLETED	Repair hydraulic pressure leak	2026-07-28 16:35:11.944	\N	2026-07-28 16:35:11.951	2026-07-28 16:35:11.974	\N	\N	\N	\N	\N	cms4s0e6s000uwgcnyxqshukf	\N	t	2026-07-28 16:35:11.946	2026-07-28 16:35:11.975
cms4vna50000e0wcn3mr2ekmy	cms4vna3a00030wcnttrardsf	CORRECTIVE	COMPLETED	Repair hydraulic pressure leak	2026-07-28 16:35:34.547	\N	2026-07-28 16:35:34.553	2026-07-28 16:35:34.565	\N	\N	\N	\N	\N	cms4s0e6s000uwgcnyxqshukf	\N	t	2026-07-28 16:35:34.548	2026-07-28 16:35:34.566
cms5ht5690007a4cnddh4qzkj	cms5hkl3e0005a4cnwmn4k2g5	PREVENTIVE	COMPLETED	Check the mag setup	2026-07-29 00:00:00	\N	2026-07-29 03:27:58.642	2026-07-29 04:01:55.819	\N	\N	\N	250.000000000000000000000000000000	Completed operational checks passed.	cms4s0e6s000uwgcnyxqshukf	cms4s0e6s000uwgcnyxqshukf	t	2026-07-29 02:55:59.601	2026-07-29 04:01:55.848
cms5suc9b001828cnzplrojpn	cms5sok1i000k28cnnpxovfy7	PREVENTIVE	SCHEDULED	Check the engine	2026-07-29 00:00:00	\N	\N	\N	\N	\N	\N	\N	\N	cms4s0e6s000uwgcnyxqshukf	\N	t	2026-07-29 08:04:51.215	2026-07-29 08:04:51.215
\.


--
-- Data for Name: MovementHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MovementHistory" (id, "equipmentAssetId", "movementType", "sourceBaseId", "destinationBaseId", "referenceType", "referenceId", "performedById", remarks, "createdAt") FROM stdin;
cms5hi5180000a4cnz36h1bla	cms5ghtm800062kcnktxseaec	ASSIGNMENT	cms4ssnl30010wgcn57ig7zgx	\N	ASSIGNMENT	cms5hi51x0001a4cnbqnfsazm	cms4s0e6s000uwgcnyxqshukf	have some medicine	2026-07-29 02:47:26.204
cms5iy9xh000aa4cn0wlpm3vm	cms5hkl3e0005a4cnwmn4k2g5	MAINTENANCE_START	cms4ssnl30010wgcn57ig7zgx	\N	MAINTENANCE	cms5ht5690007a4cnddh4qzkj	cms4s0e6s000uwgcnyxqshukf	Maintenance started	2026-07-29 03:27:58.661
cms5j6x27000ja4cnmgkgmvvw	cms5gg7kf00032kcnrk6v910r	TRANSFER_OUT	cms29c8i00000rgcnffhb07zo	cms4ssnl30010wgcn57ig7zgx	TRANSFER	cms5j6b60000ea4cnefclckn3	cms4s0e6s000uwgcnyxqshukf	Transfer dispatched	2026-07-29 03:34:41.887
cms5juhu800007kcn0ghs47q2	cms5gg7kf00032kcnrk6v910r	TRANSFER_IN	cms29c8i00000rgcnffhb07zo	cms4ssnl30010wgcn57ig7zgx	TRANSFER	cms5j6b60000ea4cnefclckn3	cms4s0e6s000uwgcnyxqshukf	Transfer received	2026-07-29 03:53:01.904
cms5k0dy600057kcnbvkggtvc	cms5ghtm800062kcnktxseaec	RETURN	cms4ssnl30010wgcn57ig7zgx	\N	ASSIGNMENT	cms5hi51x0001a4cnbqnfsazm	cms4s0e6s000uwgcnyxqshukf	Returned via tactical control dashboard.	2026-07-29 03:57:36.798
cms5k5xtw00097kcnu8i13mev	cms5hkl3e0005a4cnwmn4k2g5	MAINTENANCE_COMPLETE	cms4ssnl30010wgcn57ig7zgx	\N	MAINTENANCE	cms5ht5690007a4cnddh4qzkj	cms4s0e6s000uwgcnyxqshukf	Completed operational checks passed.	2026-07-29 04:01:55.844
cms5ky0iq000590cn3ptgjyps	cms5ky0ik000490cnj2nuicai	PROCUREMENT	\N	cms4ssnl30010wgcn57ig7zgx	PROCUREMENT	cms5kxij2000090cnay49x72a	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-894998	2026-07-29 04:23:45.698
cms5n4bhs0001zscn52epavuq	cms5ky0ik000490cnj2nuicai	ASSIGNMENT	cms4ssnl30010wgcn57ig7zgx	\N	ASSIGNMENT	cms5n4bi10002zscnwyq215u3	cms4s0e6s000uwgcnyxqshukf		2026-07-29 05:24:39.088
cms5p77by0005kwcnyanzvot5	cms5ghtm800062kcnktxseaec	TRANSFER_OUT	cms4ssnl30010wgcn57ig7zgx	cms29c8i00000rgcnffhb07zo	TRANSFER	cms5p6xma0000kwcnr6kvq2u6	cms4s0e6s000uwgcnyxqshukf	Transfer dispatched	2026-07-29 06:22:52.894
cms5sok1b000d28cnkev6t7xo	cms5sok0u000c28cny5s1ok74	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.359
cms5sok1f000f28cnutmnpid7	cms5sok1e000e28cnvw4ekv4g	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.363
cms5sok1g000h28cnpr39iaj5	cms5sok1g000g28cnlbrbo4ll	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.364
cms5sok1i000j28cnwb33idlt	cms5sok1h000i28cn25xbn533	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.366
cms5sok1j000l28cnld88mvqh	cms5sok1i000k28cnnpxovfy7	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.367
cms5sok1k000n28cn4be1ihiz	cms5sok1k000m28cn0iwf78zj	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.368
cms5sok1n000p28cn86paujpe	cms5sok1m000o28cnn3k5h34p	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.371
cms5sok1o000r28cnta6qu8be	cms5sok1n000q28cnwpj18t7l	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.372
cms5sok1p000t28cn84owl5tl	cms5sok1o000s28cnvvzptm7u	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.373
cms5sok1q000v28cn190jgojj	cms5sok1q000u28cnw09nl7e3	PROCUREMENT	\N	cms5rq4ic00094scnuxune2bu	PROCUREMENT	cms5smjwo000428cn8lyu2j63	cms4s0e6s000uwgcnyxqshukf	Received item from Procurement ref: PO-907282	2026-07-29 08:00:21.374
cms5sqrte000z28cnoh0woh32	cms5ky0ik000490cnj2nuicai	RETURN	cms4ssnl30010wgcn57ig7zgx	\N	ASSIGNMENT	cms5n4bi10002zscnwyq215u3	cms4s0e6s000uwgcnyxqshukf	Returned via tactical control dashboard.	2026-07-29 08:02:04.754
cms5t3rpp001i28cnel4t8uh6	cms5sok0u000c28cny5s1ok74	ASSIGNMENT	cms5rq4ic00094scnuxune2bu	\N	ASSIGNMENT	cms5t3rpx001j28cnlxl74jov	cms4s0e6s000uwgcnyxqshukf	\N	2026-07-29 08:12:11.149
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", title, message, type, priority, "isRead", "actionUrl", metadata, "createdAt", "readAt", "expiresAt") FROM stdin;
cms388pah0002w0cnhj9zoq15	\N	System Maintenance BroadCast	Scheduled background verification task is executing.	SYSTEM	LOW	t	\N	null	2026-07-27 12:52:37.001	2026-07-27 12:52:37.079	\N
cms388paa0001w0cn06lgv7vk	cms28x4pl0000lgcnv6qv5pc7	System Validation Run	The visibility layer validation script has successfully started.	SYSTEM	MEDIUM	t	\N	null	2026-07-27 12:52:36.994	2026-07-27 12:52:37.084	\N
cms4rxsm9000twgcny0vkxmfo	cms4iqim9000188cnwzfnlda5	Profile Updated	Your user details have been updated by System Admin.	SYSTEM	LOW	f	\N	null	2026-07-28 14:51:46.593	\N	\N
cms4s1jyo000zwgcnesk09kvt	cms28x4pl0000lgcnv6qv5pc7	Account Deactivated	Your account privilege has been deactivated.	SYSTEM	HIGH	f	\N	null	2026-07-28 14:54:42	\N	\N
cms4suwee0014wgcnfv1cfjug	cms4iqilr000088cnopgis8av	Profile Updated	Your user details have been updated by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-28 15:17:31.142	\N	\N
cms5k5xu9000c7kcnf4o793cm	cms4s0e6s000uwgcnyxqshukf	Maintenance Completed	Maintenance workflow has been completed for asset M416-A1.	MAINTENANCE	LOW	f	/maintenance/cms5ht5690007a4cnddh4qzkj	null	2026-07-29 04:01:55.857	\N	2026-07-29 04:01:55.856
cms4s0e6z000wwgcn0vclqiwj	\N	New User Registered	User Dhanush Maddila (ADMIN) has been created by System Admin.	SYSTEM	MEDIUM	t	\N	null	2026-07-28 14:53:47.867	2026-07-29 04:27:29.576	\N
cms4ssnl70012wgcn12jiauxl	\N	New Base Registered	Military Base Camp Vanguard (CAMP-VANGUARD) has been registered by Dhanush Maddila.	SYSTEM	MEDIUM	t	\N	null	2026-07-28 15:15:46.411	2026-07-29 04:27:29.576	\N
cms4t4oio001bwgcndp2w5j1a	\N	New Equipment Catalog Added	Equipment Med-Kit (MEDICAL) was added to catalog by Dhanush Maddila.	SYSTEM	LOW	t	\N	null	2026-07-28 15:25:07.488	2026-07-29 04:27:29.576	\N
cms5hi5490004a4cn9yld64xt	cms4s0e6s000uwgcnyxqshukf	Asset Checked Out	Asset 12211646 has been assigned to Sgt. Dhanush Maddila.	ASSIGNMENT	MEDIUM	t	/assignments/cms5hi51x0001a4cnbqnfsazm	null	2026-07-29 02:47:26.313	2026-07-29 04:27:29.576	\N
cms5ht57f0009a4cnsfx8jtl1	cms4s0e6s000uwgcnyxqshukf	Maintenance Scheduled	Maintenance of type PREVENTIVE has been scheduled for asset M416-A1.	MAINTENANCE	MEDIUM	t	/maintenance/cms5ht5690007a4cnddh4qzkj	null	2026-07-29 02:55:59.643	2026-07-29 04:27:29.576	\N
cms5iy9xw000da4cnqi2d8qf9	cms4s0e6s000uwgcnyxqshukf	Maintenance Started	Maintenance workflow has been started for asset M416-A1.	MAINTENANCE	MEDIUM	t	/maintenance/cms5ht5690007a4cnddh4qzkj	null	2026-07-29 03:27:58.676	2026-07-29 04:27:29.576	\N
cms5j6bhj000ga4cnqlvtkzun	\N	New Transfer Initiated	Transfer of asset 12211645 from base cms29c8i00000rgcnffhb07zo to cms4ssnl30010wgcn57ig7zgx has been requested.	TRANSFER	MEDIUM	t	/transfers/cms5j6b60000ea4cnefclckn3	null	2026-07-29 03:34:13.927	2026-07-29 04:27:29.576	\N
cms5j6p1w000ia4cntjjo3h0a	\N	Transfer Approved	Asset transfer request cms5j6b60000ea4cnefclckn3 has been approved.	TRANSFER	MEDIUM	t	/transfers/cms5j6b60000ea4cnefclckn3	null	2026-07-29 03:34:31.508	2026-07-29 04:27:29.576	\N
cms5j6x2j000ma4cnqpbvnljj	\N	Transfer Dispatched	Transfer of asset 12211645 has been dispatched.	TRANSFER	MEDIUM	t	/transfers/cms5j6b60000ea4cnefclckn3	null	2026-07-29 03:34:41.899	2026-07-29 04:27:29.576	\N
cms5jjj0o000ta4cnb6wkbco2	cms4s0e6s000uwgcnyxqshukf	Inspection Scheduled	Inspection scheduled for asset M416-A2 on 7/29/2026.	MAINTENANCE	MEDIUM	t	/inspections/cms5jjj00000ra4cng83ky6c2	null	2026-07-29 03:44:30.216	2026-07-29 04:27:29.576	\N
cms5jp72h0001tscnsvx9k9g9	cms4s0e6s000uwgcnyxqshukf	Inspection Completed	Inspection completed for asset M416-A2 (Result: PASS).	MAINTENANCE	LOW	t	/inspections/cms5jjj00000ra4cng83ky6c2	null	2026-07-29 03:48:54.665	2026-07-29 04:27:29.576	\N
cms5juhuu00047kcn9hua74xl	\N	Transfer Completed	Asset 12211645 transfer from base cms29c8i00000rgcnffhb07zo to cms4ssnl30010wgcn57ig7zgx has been successfully completed.	TRANSFER	MEDIUM	t	/transfers/cms5j6b60000ea4cnefclckn3	null	2026-07-29 03:53:01.926	2026-07-29 04:27:29.576	\N
cms5k0dyr00087kcnau01lr07	cms4s0e6s000uwgcnyxqshukf	Asset Returned	Asset 12211646 has been returned.	ASSIGNMENT	LOW	t	/assignments/cms5hi51x0001a4cnbqnfsazm	null	2026-07-29 03:57:36.819	2026-07-29 04:27:29.576	\N
cms5kq7f0000244cnhy5qx685	\N	New Supplier Registered	Supplier Maddix Tech (NGC-MAD) has been registered by Dhanush Maddila.	SYSTEM	LOW	t	\N	null	2026-07-29 04:17:41.388	2026-07-29 04:27:29.576	\N
cms5kxqvh000390cn3eepfq01	cms4s0e6s000uwgcnyxqshukf	Procurement Order Approved	Procurement order #PO-894998 has been approved.	PROCUREMENT	MEDIUM	t	/procurement/cms5kxij2000090cnay49x72a	null	2026-07-29 04:23:33.197	2026-07-29 04:27:29.576	\N
cms5ky0je000890cn46e33lh6	cms4s0e6s000uwgcnyxqshukf	Procurement Order Completed	Procurement order #PO-894998 items have been received (Status: RECEIVED).	PROCUREMENT	MEDIUM	t	/procurement/cms5kxij2000090cnay49x72a	null	2026-07-29 04:23:45.722	2026-07-29 04:27:29.576	\N
cms5n4bmn0005zscn35iwct8a	cms4s0e6s000uwgcnyxqshukf	Asset Checked Out	Asset 123455 has been assigned to Officer.	ASSIGNMENT	MEDIUM	t	/assignments/cms5n4bi10002zscnwyq215u3	null	2026-07-29 05:24:39.263	2026-07-29 05:27:52.027	\N
cms5p6xnr0002kwcnmbyjxsm5	\N	New Transfer Initiated	Transfer of asset 12211646 from base cms4ssnl30010wgcn57ig7zgx to cms29c8i00000rgcnffhb07zo has been requested.	TRANSFER	MEDIUM	f	/transfers/cms5p6xma0000kwcnr6kvq2u6	null	2026-07-29 06:22:40.359	\N	\N
cms5p74q70004kwcndpte6gf2	\N	Transfer Approved	Asset transfer request cms5p6xma0000kwcnr6kvq2u6 has been approved.	TRANSFER	MEDIUM	f	/transfers/cms5p6xma0000kwcnr6kvq2u6	null	2026-07-29 06:22:49.519	\N	\N
cms5p77cc0008kwcnou2qaj02	\N	Transfer Dispatched	Transfer of asset 12211646 has been dispatched.	TRANSFER	MEDIUM	f	/transfers/cms5p6xma0000kwcnr6kvq2u6	null	2026-07-29 06:22:52.908	\N	\N
cms5rq4ih000b4scndxtskdis	\N	New Base Registered	Military Base Fort Alpha (FA-01) has been registered by Dhanush Maddila.	SYSTEM	MEDIUM	f	\N	null	2026-07-29 07:33:34.937	\N	\N
cms5rt5ya000e4scnox2w9uu9	\N	New Base Registered	Military Base Fort Bravo (FB-01) has been registered by Dhanush Maddila.	SYSTEM	MEDIUM	f	\N	null	2026-07-29 07:35:56.77	\N	\N
cms5rtjjq000h4scnfyo1rnzy	\N	New Base Registered	Military Base Fort Charlie (FC-01) has been registered by Dhanush Maddila.	SYSTEM	MEDIUM	f	\N	null	2026-07-29 07:36:14.39	\N	\N
cms5ru8ko000j4scnq1jr1b96	cms4iqilr000088cnopgis8av	Profile Updated	Your user details have been updated by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:36:46.824	\N	\N
cms5rur13000m4scn0yq9xzyw	\N	New User Registered	User Miller (BASE_COMMANDER) has been created by Dhanush Maddila.	SYSTEM	MEDIUM	f	\N	null	2026-07-29 07:37:10.743	\N	\N
cms5rv3xc000o4scn0l5yfsb0	cms4iqim9000188cnwzfnlda5	Profile Updated	Your user details have been updated by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:37:27.456	\N	\N
cms5rxbmv000r4scnz6xkuqjy	\N	New Supplier Registered	Supplier East Group Tech (EGT-01) has been registered by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:39:10.759	\N	\N
cms5ry3g5000u4scnl4t9e0ql	\N	New Supplier Registered	Supplier Boeing Logistic Tech (BLT-01) has been registered by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:39:46.805	\N	\N
cms5ryzcv000x4scnixtbtgup	\N	New Supplier Registered	Supplier General Dynamics Tech (GDT-01) has been registered by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:40:28.159	\N	\N
cms5sc0r10002twcn1gcyvsd3	\N	New Equipment Catalog Added	Equipment M4 Carbine (WEAPON) was added to catalog by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:50:36.493	\N	\N
cms5sch230005twcnbwqt0ada	\N	New Equipment Catalog Added	Equipment Tank (VEHICLE) was added to catalog by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:50:57.627	\N	\N
cms5scw720008twcnpzliswgh	\N	New Equipment Catalog Added	Equipment Jeep (VEHICLE) was added to catalog by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:51:17.246	\N	\N
cms5sdhw3000btwcnetmla0ax	\N	New Equipment Catalog Added	Equipment Night Vision Goggles (OTHER) was added to catalog by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:51:45.363	\N	\N
cms5se0e6000etwcnqbrsz7v3	\N	New Equipment Catalog Added	Equipment 5.56 Ammo (WEAPON) was added to catalog by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:52:09.342	\N	\N
cms5sefa5000htwcnwatepap9	\N	New Equipment Catalog Added	Equipment Radio (OTHER) was added to catalog by Dhanush Maddila.	SYSTEM	LOW	f	\N	null	2026-07-29 07:52:28.637	\N	\N
cms5smlvo000728cnqhs93sgy	cms4s0e6s000uwgcnyxqshukf	Procurement Order Approved	Procurement order #PO-907282 has been approved.	PROCUREMENT	MEDIUM	f	/procurement/cms5smjwo000428cn8lyu2j63	null	2026-07-29 07:58:50.436	\N	\N
cms5smn0r000928cnz2oaprxg	cms4s0e6s000uwgcnyxqshukf	Procurement Order Approved	Procurement order #PO-873462 has been approved.	PROCUREMENT	MEDIUM	f	/procurement/cms5sm2c8000228cnpt0f57gm	null	2026-07-29 07:58:51.915	\N	\N
cms5smnta000b28cntzlhdu23	cms4s0e6s000uwgcnyxqshukf	Procurement Order Approved	Procurement order #PO-813336 has been approved.	PROCUREMENT	MEDIUM	f	/procurement/cms5sl5au000028cni8z2dro2	null	2026-07-29 07:58:52.942	\N	\N
cms5sok2c000y28cnjw80k2kh	cms4s0e6s000uwgcnyxqshukf	Procurement Order Completed	Procurement order #PO-907282 items have been received (Status: RECEIVED).	PROCUREMENT	MEDIUM	f	/procurement/cms5smjwo000428cn8lyu2j63	null	2026-07-29 08:00:21.396	\N	\N
cms5sqrtr001228cncu0dw8b0	cms4s0e6s000uwgcnyxqshukf	Asset Returned	Asset 123455 has been returned.	ASSIGNMENT	LOW	f	/assignments/cms5n4bi10002zscnwyq215u3	null	2026-07-29 08:02:04.767	\N	\N
cms5su2rk001728cnyrq0q9o5	\N	New Transfer Initiated	Transfer of asset JP7 from base cms5rq4ic00094scnuxune2bu to cms5rt5y7000c4scnnee0voy5 has been requested.	TRANSFER	MEDIUM	f	/transfers/cms5su2qc001528cnjgmzekoo	null	2026-07-29 08:04:38.912	\N	\N
cms5sucag001a28cnu4t2rvqv	cms4s0e6s000uwgcnyxqshukf	Maintenance Scheduled	Maintenance of type PREVENTIVE has been scheduled for asset JP5.	MAINTENANCE	MEDIUM	f	/maintenance/cms5suc9b001828cnzplrojpn	null	2026-07-29 08:04:51.256	\N	\N
cms5t3kpp001f28cnrupayflt	cms4s0e6s000uwgcnyxqshukf	Inspection Scheduled	Inspection scheduled for asset JP10 on 7/29/2026.	MAINTENANCE	MEDIUM	f	/inspections/cms5t3kor001d28cnlpkcomf6	null	2026-07-29 08:12:02.077	\N	\N
cms5t3kro001h28cnfdod1j9w	cms4s0e6s000uwgcnyxqshukf	Inspection Completed	Inspection completed for asset JP10 (Result: PASS).	MAINTENANCE	LOW	f	/inspections/cms5t3kor001d28cnlpkcomf6	null	2026-07-29 08:12:02.148	\N	\N
cms5t3rto001m28cnt2lr9zdk	cms4s0e6s000uwgcnyxqshukf	Asset Checked Out	Asset JP1 has been assigned to Maj. Dhanush Srinivas.	ASSIGNMENT	MEDIUM	f	/assignments/cms5t3rpx001j28cnlxl74jov	null	2026-07-29 08:12:11.292	\N	\N
cms5t4lmg001p28cnhwjx0phg	cms4s0e6s000uwgcnyxqshukf	Inspection Scheduled	Inspection scheduled for asset JP4 on 7/29/2026.	MAINTENANCE	MEDIUM	f	/inspections/cms5t4lmb001n28cnc008qr8u	null	2026-07-29 08:12:49.912	\N	\N
cms5t4lnt001r28cn7xdny7qe	cms4s0e6s000uwgcnyxqshukf	Inspection Completed	Inspection completed for asset JP4 (Result: PASS).	MAINTENANCE	LOW	f	/inspections/cms5t4lmb001n28cnc008qr8u	null	2026-07-29 08:12:49.961	\N	\N
cms5t5bn9001u28cns7lo90nc	cms4s0e6s000uwgcnyxqshukf	Inspection Scheduled	Inspection scheduled for asset M416-A2 on 7/29/2026.	MAINTENANCE	MEDIUM	f	/inspections/cms5t5bn5001s28cnegky8zzj	null	2026-07-29 08:13:23.637	\N	\N
\.


--
-- Data for Name: OrganizationUnit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrganizationUnit" (id, name, code, level, "parentId", "createdAt", "updatedAt") FROM stdin;
cms5gs6bd0000jccnkrzuw4md	Fort Braxton HQ	FBHQ	COMMAND	\N	2026-07-29 02:27:14.81	2026-07-29 02:27:14.81
cms5h53a40000pwcntojstada	Fort Braxton HQ 1	FBHQ1	DIVISION	cms5gs6bd0000jccnkrzuw4md	2026-07-29 02:37:17.405	2026-07-29 02:37:17.405
cms5rnqd800014scn84a5rm5t	Army	ARMY-01	COMMAND	\N	2026-07-29 07:31:43.292	2026-07-29 07:31:43.292
cms5roeva00034scnmjt7bcsl	Northern Command	NC-01	DIVISION	cms5rnqd800014scn84a5rm5t	2026-07-29 07:32:15.046	2026-07-29 07:32:15.046
cms5rous100054scn2wn27pwh	Southern Command	SC-01	DIVISION	cms5rnqd800014scn84a5rm5t	2026-07-29 07:32:35.665	2026-07-29 07:32:35.665
cms5rpdkf00074scn2dxrxixk	Eastern Command	EC-01	DIVISION	cms5rnqd800014scn84a5rm5t	2026-07-29 07:33:00.015	2026-07-29 07:33:00.015
\.


--
-- Data for Name: Personnel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Personnel" (id, "serviceNumber", rank, "firstName", "lastName", "unitId", email, phone, status, "createdAt", "updatedAt") FROM stdin;
cms5h5hwx0002pwcn6qydgyi2	12211645	Sgt.	Dhanush	Maddila	cms5h53a40000pwcntojstada	dhanushmaddila@gmail.com	8688180745	ACTIVE	2026-07-29 02:37:36.369	2026-07-29 02:37:36.369
cms5ss0v8001328cngoyn3y68	12211647	Maj.	Dhanush	Srinivas	cms5rnqd800014scn84a5rm5t	dhanushmaddila0905@gmail.com	+918688180745	ACTIVE	2026-07-29 08:03:03.14	2026-07-29 08:03:03.14
\.


--
-- Data for Name: Procurement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Procurement" (id, "procurementNumber", supplier, status, "purchaseDate", "expectedDeliveryDate", "receivedDate", "totalCost", remarks, "baseId", "createdById", "createdAt", "updatedAt", "supplierId") FROM stdin;
cms4vlo180001v0cnnxwbbtyl	PO-459227	Lockheed Operations	RECEIVED	2026-07-28 16:34:19.227	2026-07-28 16:34:19.227	\N	180000.000000000000000000000000000000	E2E verification order	cms29c8i00000rgcnffhb07zo	cms4s0e6s000uwgcnyxqshukf	2026-07-28 16:34:19.244	2026-07-28 16:34:19.288	\N
cms4vlvmy0001a0cntabqyqp6	PO-469080	Lockheed Operations	RECEIVED	2026-07-28 16:34:29.08	2026-07-28 16:34:29.08	\N	180000.000000000000000000000000000000	E2E verification order	cms29c8i00000rgcnffhb07zo	cms4s0e6s000uwgcnyxqshukf	2026-07-28 16:34:29.098	2026-07-28 16:34:29.119	\N
cms4vm30c0001dccntnoo7c19	PO-478622	Lockheed Operations	RECEIVED	2026-07-28 16:34:38.622	2026-07-28 16:34:38.622	\N	180000.000000000000000000000000000000	E2E verification order	cms29c8i00000rgcnffhb07zo	cms4s0e6s000uwgcnyxqshukf	2026-07-28 16:34:38.652	2026-07-28 16:34:38.676	\N
cms4vm9m5000100cne5rvbrt1	PO-487194	Lockheed Operations	RECEIVED	2026-07-28 16:34:47.194	2026-07-28 16:34:47.194	\N	180000.000000000000000000000000000000	E2E verification order	cms29c8i00000rgcnffhb07zo	cms4s0e6s000uwgcnyxqshukf	2026-07-28 16:34:47.213	2026-07-28 16:34:47.237	\N
cms4vmkt20001mwcnp4vijxch	PO-501699	Lockheed Operations	RECEIVED	2026-07-28 16:35:01.699	2026-07-28 16:35:01.699	\N	180000.000000000000000000000000000000	E2E verification order	cms29c8i00000rgcnffhb07zo	cms4s0e6s000uwgcnyxqshukf	2026-07-28 16:35:01.718	2026-07-28 16:35:01.74	\N
cms4vmslk0001aocnmidqffmv	PO-511777	Lockheed Operations	RECEIVED	2026-07-28 16:35:11.778	2026-07-28 16:35:11.778	\N	180000.000000000000000000000000000000	E2E verification order	cms29c8i00000rgcnffhb07zo	cms4s0e6s000uwgcnyxqshukf	2026-07-28 16:35:11.816	2026-07-28 16:35:11.856	\N
cms4vna2v00010wcn3l5d6f7c	PO-534451	Lockheed Operations	RECEIVED	2026-07-28 16:35:34.451	2026-07-28 16:35:34.451	\N	180000.000000000000000000000000000000	E2E verification order	cms29c8i00000rgcnffhb07zo	cms4s0e6s000uwgcnyxqshukf	2026-07-28 16:35:34.471	2026-07-28 16:35:34.494	\N
cms5kxij2000090cnay49x72a	PO-894998	Madix	RECEIVED	2026-07-29 00:00:00	2026-08-05 00:00:00	2026-07-29 04:23:45.705	1000.000000000000000000000000000000	Test rifle	cms4ssnl30010wgcn57ig7zgx	cms4s0e6s000uwgcnyxqshukf	2026-07-29 04:23:22.382	2026-07-29 04:23:45.706	\N
cms5sm2c8000228cnpt0f57gm	PO-873462	Maddix Tech	APPROVED	2026-07-29 00:00:00	2026-08-05 00:00:00	\N	50000.000000000000000000000000000000	\N	cms5rq4ic00094scnuxune2bu	cms4s0e6s000uwgcnyxqshukf	2026-07-29 07:58:25.112	2026-07-29 07:58:51.91	cms5kq7er000044cnll886sjq
cms5sl5au000028cni8z2dro2	PO-813336	Maddix Tech	APPROVED	2026-07-29 00:00:00	2026-08-05 00:00:00	\N	50000.000000000000000000000000000000	\N	cms5rq4ic00094scnuxune2bu	cms4s0e6s000uwgcnyxqshukf	2026-07-29 07:57:42.294	2026-07-29 07:58:52.939	cms5kq7er000044cnll886sjq
cms5smjwo000428cn8lyu2j63	PO-907282	Boeing Logistic Tech	RECEIVED	2026-07-29 00:00:00	2026-08-05 00:00:00	2026-07-29 08:00:21.379	100000.000000000000000000000000000000	\N	cms5rq4ic00094scnuxune2bu	cms4s0e6s000uwgcnyxqshukf	2026-07-29 07:58:47.88	2026-07-29 08:00:21.38	cms5ry3g1000s4scn8vueu77v
\.


--
-- Data for Name: ProcurementItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProcurementItem" (id, "procurementId", "equipmentId", quantity, "receivedQuantity", "unitCost") FROM stdin;
cms4vlo1i0002v0cnsbz74whd	cms4vlo180001v0cnnxwbbtyl	cms2wwsnn00008scnk0qv9ev4	2	2	90000.000000000000000000000000000000
cms4vlvn00002a0cnn90wkzp4	cms4vlvmy0001a0cntabqyqp6	cms2wwsnn00008scnk0qv9ev4	2	2	90000.000000000000000000000000000000
cms4vm30f0002dccnu7tkvqf3	cms4vm30c0001dccntnoo7c19	cms2wwsnn00008scnk0qv9ev4	2	2	90000.000000000000000000000000000000
cms4vm9m7000200cne5jot1aa	cms4vm9m5000100cne5rvbrt1	cms2wwsnn00008scnk0qv9ev4	2	2	90000.000000000000000000000000000000
cms4vmkt40002mwcnntf9z6et	cms4vmkt20001mwcnp4vijxch	cms2wwsnn00008scnk0qv9ev4	2	2	90000.000000000000000000000000000000
cms4vmslp0002aocn7jw49pf6	cms4vmslk0001aocnmidqffmv	cms2wwsnn00008scnk0qv9ev4	2	2	90000.000000000000000000000000000000
cms4vna2x00020wcnr34aiyup	cms4vna2v00010wcn3l5d6f7c	cms2wwsnn00008scnk0qv9ev4	2	2	90000.000000000000000000000000000000
cms5kxij6000190cnb9pen7cv	cms5kxij2000090cnay49x72a	cms37jjpt0002wocnafie3uto	1	1	1000.000000000000000000000000000000
cms5sl5ax000128cn9teti6hh	cms5sl5au000028cni8z2dro2	cms5se0dz000ctwcn85x5hy3d	5000	0	10.000000000000000000000000000000
cms5sm2c9000328cnp7zy4eyl	cms5sm2c8000228cnpt0f57gm	cms5sc0qn0000twcnkfe86jmt	50	0	1000.000000000000000000000000000000
cms5smjwp000528cno7xlz78v	cms5smjwo000428cn8lyu2j63	cms5scw6v0006twcngulad9q3	10	10	10000.000000000000000000000000000000
\.


--
-- Data for Name: Purchase; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Purchase" (id, "baseId", "equipmentId", quantity, vendor, "purchasedById", remarks, "purchasedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReportJob; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ReportJob" (id, "reportType", "exportFormat", "requestedById", status, filters, "storageKey", "errorMessage", "requestedAt", "startedAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Supplier" (id, name, code, "contactName", email, phone, address, status, "isActive", "createdAt", "updatedAt") FROM stdin;
cms5kq7er000044cnll886sjq	Maddix Tech	NGC-MAD	Dhanush Maddila	dhanushmaddila0905@gmail.com	+918688180745	Lovely Professional University	ACTIVE	t	2026-07-29 04:17:41.379	2026-07-29 04:17:41.379
cms5rxbmi000p4scn95tucroh	East Group Tech	EGT-01	Lockheed Martin	eastgroup@gmail.com	7547386234	Lovely Professional University	ACTIVE	t	2026-07-29 07:39:10.746	2026-07-29 07:39:10.746
cms5ry3g1000s4scn8vueu77v	Boeing Logistic Tech	BLT-01	Boeing	boeing@gmail.com	7547386234	Lovely Professional University	ACTIVE	t	2026-07-29 07:39:46.801	2026-07-29 07:39:46.801
cms5ryzcr000v4scnmeu4zvkm	General Dynamics Tech	GDT-01	General Thomas	general@mail.com	7547386234	Lovely Professional University	ACTIVE	t	2026-07-29 07:40:28.155	2026-07-29 07:40:28.155
\.


--
-- Data for Name: SystemConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SystemConfig" (key, value, description, "createdAt", "updatedAt") FROM stdin;
LOW_STOCK_THRESHOLD	10	Inventory considered low below this quantity	2026-07-29 05:03:10.487	2026-07-29 05:03:10.487
\.


--
-- Data for Name: Transfer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Transfer" (id, "fromBaseId", "toBaseId", quantity, "transferredById", remarks, status, "transferredAt", "createdAt", "updatedAt", "equipmentAssetId") FROM stdin;
cms4vmku30008mwcnpch4g5ap	cms29c8i00000rgcnffhb07zo	cms28zhvn0000t8cnfimpr1e0	1	cms4s0e6s000uwgcnyxqshukf	Transfer test	COMPLETED	2026-07-28 16:35:01.755	2026-07-28 16:35:01.755	2026-07-28 16:35:01.774	cms4vmkti0003mwcnfeg784dy
cms4vmsnl0008aocnutnzp8bl	cms29c8i00000rgcnffhb07zo	cms28zhvn0000t8cnfimpr1e0	1	cms4s0e6s000uwgcnyxqshukf	Transfer test	COMPLETED	2026-07-28 16:35:11.887	2026-07-28 16:35:11.889	2026-07-28 16:35:11.922	cms4vmsme0003aocnnxd4bshu
cms4vna3x00080wcnq9bsperl	cms29c8i00000rgcnffhb07zo	cms28zhvn0000t8cnfimpr1e0	1	cms4s0e6s000uwgcnyxqshukf	Transfer test	COMPLETED	2026-07-28 16:35:34.508	2026-07-28 16:35:34.509	2026-07-28 16:35:34.532	cms4vna3a00030wcnttrardsf
cms4vlo2u0008v0cnezwndzna	cms29c8i00000rgcnffhb07zo	cms28zhvn0000t8cnfimpr1e0	1	cms4s0e6s000uwgcnyxqshukf	Transfer test	COMPLETED	2026-07-28 16:34:19.301	2026-07-28 16:34:19.302	2026-07-28 16:34:19.321	cms4vlo1x0003v0cnu13gmkf2
cms4vlvnz0008a0cn0tqmyfxl	cms29c8i00000rgcnffhb07zo	cms28zhvn0000t8cnfimpr1e0	1	cms4s0e6s000uwgcnyxqshukf	Transfer test	COMPLETED	2026-07-28 16:34:29.134	2026-07-28 16:34:29.135	2026-07-28 16:34:29.153	cms4vlvne0003a0cnvsvtsnwt
cms4vm31h0008dccnkk9d1h2h	cms29c8i00000rgcnffhb07zo	cms28zhvn0000t8cnfimpr1e0	1	cms4s0e6s000uwgcnyxqshukf	Transfer test	COMPLETED	2026-07-28 16:34:38.691	2026-07-28 16:34:38.693	2026-07-28 16:34:38.713	cms4vm30s0003dccnpsnqxpnk
cms5j6b60000ea4cnefclckn3	cms29c8i00000rgcnffhb07zo	cms4ssnl30010wgcn57ig7zgx	1	cms4s0e6s000uwgcnyxqshukf	They need meds	COMPLETED	2026-07-29 03:34:13.511	2026-07-29 03:34:13.512	2026-07-29 03:53:01.908	cms5gg7kf00032kcnrk6v910r
cms4vm9n9000800cnt8xunf2k	cms29c8i00000rgcnffhb07zo	cms28zhvn0000t8cnfimpr1e0	1	cms4s0e6s000uwgcnyxqshukf	Transfer test	COMPLETED	2026-07-28 16:34:47.252	2026-07-28 16:34:47.253	2026-07-28 16:34:47.274	cms4vm9ml000300cnv5qw95vc
cms5p6xma0000kwcnr6kvq2u6	cms4ssnl30010wgcn57ig7zgx	cms29c8i00000rgcnffhb07zo	1	cms4s0e6s000uwgcnyxqshukf	\N	IN_TRANSIT	2026-07-29 06:22:40.291	2026-07-29 06:22:40.306	2026-07-29 06:22:52.897	cms5ghtm800062kcnktxseaec
cms5su2qc001528cnjgmzekoo	cms5rq4ic00094scnuxune2bu	cms5rt5y7000c4scnnee0voy5	1	cms4s0e6s000uwgcnyxqshukf	\N	PENDING	2026-07-29 08:04:38.867	2026-07-29 08:04:38.868	2026-07-29 08:04:38.868	cms5sok1m000o28cnn3k5h34p
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, password, role, status, "baseId", "createdAt", "updatedAt") FROM stdin;
cms4s0e6s000uwgcnyxqshukf	Dhanush Maddila	dhanush@gmail.com	$2b$12$8Uip8jH2/13GuqVxhASvD.Q0f8/Co4b2QVwhvgdlRlIyXySEVNb/O	ADMIN	ACTIVE	\N	2026-07-28 14:53:47.86	2026-07-28 14:53:47.86
cms28x4pl0000lgcnv6qv5pc7	System Admin	admin@military.gov	$2b$12$IDDGlVLjxjd9iMghum5B2eOUHAwWBj5NNX6uMLre0pwb0fAlpaI2G	ADMIN	DEACTIVATED	\N	2026-07-26 20:23:50.553	2026-07-28 14:54:41.996
cms4iqilr000088cnopgis8av	Col. Reeves	alexander.reeves@military.gov	$2b$10$YL5Y72qo6KEVo5OOX18d9OA3eJxMuWAfgcNgOCOcAAzeBYNhX.2CS	BASE_COMMANDER	ACTIVE	cms5rt5y7000c4scnnee0voy5	2026-07-28 10:34:10.479	2026-07-29 07:36:46.749
cms5rur0z000k4scn111m3cx1	Miller	miller@gmail.com	$2b$12$PWawBmlrHW6j9k7rONGdGO293ALWMPBa9yO0LvX90dD8/Q/w.njLC	BASE_COMMANDER	ACTIVE	cms5rq4ic00094scnuxune2bu	2026-07-29 07:37:10.739	2026-07-29 07:37:10.739
cms4iqim9000188cnwzfnlda5	Maj. Chen	wei.chen@military.gov	$2b$10$YL5Y72qo6KEVo5OOX18d9OA3eJxMuWAfgcNgOCOcAAzeBYNhX.2CS	LOGISTICS_OFFICER	ACTIVE	cms5rq4ic00094scnuxune2bu	2026-07-28 10:34:10.497	2026-07-29 07:37:27.451
\.


--
-- Data for Name: Warranty; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Warranty" (id, "equipmentAssetId", "startDate", "endDate", "vendorId", "coverageDetails", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9f865fb7-fe11-4f3a-9134-999067046cb7	330c049c96da27943765e45d933416dea6631af9f86f834b60be658cf8d9f967	2026-07-27 01:52:35.295465+05:30	20260724193816_init	\N	\N	2026-07-27 01:52:35.166266+05:30	1
b73f160e-e48d-44f8-80c4-5e07788a520f	14f5d5d7d5829685b24a3e3551b97fa8f97a5a4585c591b5fc99ed8aad60eda2	2026-07-27 01:53:38.240357+05:30	20260726202400_add_base_code_soft_delete	\N	\N	2026-07-27 01:53:38.170393+05:30	1
\.


--
-- Name: AssetValuation AssetValuation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssetValuation"
    ADD CONSTRAINT "AssetValuation_pkey" PRIMARY KEY (id);


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: Attachment Attachment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Base Base_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Base"
    ADD CONSTRAINT "Base_pkey" PRIMARY KEY (id);


--
-- Name: CronJobLog CronJobLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CronJobLog"
    ADD CONSTRAINT "CronJobLog_pkey" PRIMARY KEY (id);


--
-- Name: DepreciationHistory DepreciationHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepreciationHistory"
    ADD CONSTRAINT "DepreciationHistory_pkey" PRIMARY KEY (id);


--
-- Name: Disposal Disposal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Disposal"
    ADD CONSTRAINT "Disposal_pkey" PRIMARY KEY (id);


--
-- Name: EquipmentAsset EquipmentAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EquipmentAsset"
    ADD CONSTRAINT "EquipmentAsset_pkey" PRIMARY KEY (id);


--
-- Name: Equipment Equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY (id);


--
-- Name: Expenditure Expenditure_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expenditure"
    ADD CONSTRAINT "Expenditure_pkey" PRIMARY KEY (id);


--
-- Name: Inspection Inspection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inspection"
    ADD CONSTRAINT "Inspection_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: Ledger Ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_pkey" PRIMARY KEY (id);


--
-- Name: Maintenance Maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Maintenance"
    ADD CONSTRAINT "Maintenance_pkey" PRIMARY KEY (id);


--
-- Name: MovementHistory MovementHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovementHistory"
    ADD CONSTRAINT "MovementHistory_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrganizationUnit OrganizationUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUnit"
    ADD CONSTRAINT "OrganizationUnit_pkey" PRIMARY KEY (id);


--
-- Name: Personnel Personnel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Personnel"
    ADD CONSTRAINT "Personnel_pkey" PRIMARY KEY (id);


--
-- Name: ProcurementItem ProcurementItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProcurementItem"
    ADD CONSTRAINT "ProcurementItem_pkey" PRIMARY KEY (id);


--
-- Name: Procurement Procurement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Procurement"
    ADD CONSTRAINT "Procurement_pkey" PRIMARY KEY (id);


--
-- Name: Purchase Purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY (id);


--
-- Name: ReportJob ReportJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReportJob"
    ADD CONSTRAINT "ReportJob_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: SystemConfig SystemConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemConfig"
    ADD CONSTRAINT "SystemConfig_pkey" PRIMARY KEY (key);


--
-- Name: Transfer Transfer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Warranty Warranty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Warranty"
    ADD CONSTRAINT "Warranty_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AssetValuation_equipmentAssetId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AssetValuation_equipmentAssetId_key" ON public."AssetValuation" USING btree ("equipmentAssetId");


--
-- Name: Assignment_assignedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Assignment_assignedById_idx" ON public."Assignment" USING btree ("assignedById");


--
-- Name: Assignment_baseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Assignment_baseId_idx" ON public."Assignment" USING btree ("baseId");


--
-- Name: Assignment_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Assignment_equipmentAssetId_idx" ON public."Assignment" USING btree ("equipmentAssetId");


--
-- Name: Assignment_personnelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Assignment_personnelId_idx" ON public."Assignment" USING btree ("personnelId");


--
-- Name: Assignment_returnedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Assignment_returnedById_idx" ON public."Assignment" USING btree ("returnedById");


--
-- Name: Attachment_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attachment_entityType_entityId_idx" ON public."Attachment" USING btree ("entityType", "entityId");


--
-- Name: Attachment_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attachment_isActive_idx" ON public."Attachment" USING btree ("isActive");


--
-- Name: Attachment_storageKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Attachment_storageKey_key" ON public."Attachment" USING btree ("storageKey");


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entityType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_entityType_idx" ON public."AuditLog" USING btree ("entityType");


--
-- Name: AuditLog_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_module_idx" ON public."AuditLog" USING btree (module);


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: Base_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Base_code_key" ON public."Base" USING btree (code);


--
-- Name: CronJobLog_jobName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CronJobLog_jobName_idx" ON public."CronJobLog" USING btree ("jobName");


--
-- Name: CronJobLog_startedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CronJobLog_startedAt_idx" ON public."CronJobLog" USING btree ("startedAt");


--
-- Name: DepreciationHistory_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DepreciationHistory_date_idx" ON public."DepreciationHistory" USING btree (date);


--
-- Name: DepreciationHistory_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DepreciationHistory_equipmentAssetId_idx" ON public."DepreciationHistory" USING btree ("equipmentAssetId");


--
-- Name: Disposal_approvedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Disposal_approvedById_idx" ON public."Disposal" USING btree ("approvedById");


--
-- Name: Disposal_disposalReason_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Disposal_disposalReason_idx" ON public."Disposal" USING btree ("disposalReason");


--
-- Name: Disposal_disposedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Disposal_disposedById_idx" ON public."Disposal" USING btree ("disposedById");


--
-- Name: Disposal_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Disposal_equipmentAssetId_idx" ON public."Disposal" USING btree ("equipmentAssetId");


--
-- Name: Disposal_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Disposal_status_idx" ON public."Disposal" USING btree (status);


--
-- Name: EquipmentAsset_baseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EquipmentAsset_baseId_idx" ON public."EquipmentAsset" USING btree ("baseId");


--
-- Name: EquipmentAsset_equipmentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EquipmentAsset_equipmentId_idx" ON public."EquipmentAsset" USING btree ("equipmentId");


--
-- Name: EquipmentAsset_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EquipmentAsset_isActive_idx" ON public."EquipmentAsset" USING btree ("isActive");


--
-- Name: EquipmentAsset_serialNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "EquipmentAsset_serialNumber_key" ON public."EquipmentAsset" USING btree ("serialNumber");


--
-- Name: EquipmentAsset_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EquipmentAsset_status_idx" ON public."EquipmentAsset" USING btree (status);


--
-- Name: EquipmentAsset_unitId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EquipmentAsset_unitId_idx" ON public."EquipmentAsset" USING btree ("unitId");


--
-- Name: Equipment_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Equipment_category_idx" ON public."Equipment" USING btree (category);


--
-- Name: Equipment_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Equipment_isActive_idx" ON public."Equipment" USING btree ("isActive");


--
-- Name: Equipment_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Equipment_supplierId_idx" ON public."Equipment" USING btree ("supplierId");


--
-- Name: Expenditure_baseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expenditure_baseId_idx" ON public."Expenditure" USING btree ("baseId");


--
-- Name: Expenditure_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expenditure_equipmentAssetId_idx" ON public."Expenditure" USING btree ("equipmentAssetId");


--
-- Name: Expenditure_expendedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expenditure_expendedById_idx" ON public."Expenditure" USING btree ("expendedById");


--
-- Name: Inspection_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inspection_equipmentAssetId_idx" ON public."Inspection" USING btree ("equipmentAssetId");


--
-- Name: Inspection_result_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inspection_result_idx" ON public."Inspection" USING btree (result);


--
-- Name: Inspection_scheduledDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inspection_scheduledDate_idx" ON public."Inspection" USING btree ("scheduledDate");


--
-- Name: Inventory_baseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inventory_baseId_idx" ON public."Inventory" USING btree ("baseId");


--
-- Name: Inventory_equipmentId_baseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Inventory_equipmentId_baseId_key" ON public."Inventory" USING btree ("equipmentId", "baseId");


--
-- Name: Inventory_equipmentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inventory_equipmentId_idx" ON public."Inventory" USING btree ("equipmentId");


--
-- Name: Inventory_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inventory_isActive_idx" ON public."Inventory" USING btree ("isActive");


--
-- Name: Ledger_assignmentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_assignmentId_idx" ON public."Ledger" USING btree ("assignmentId");


--
-- Name: Ledger_baseId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_baseId_createdAt_idx" ON public."Ledger" USING btree ("baseId", "createdAt");


--
-- Name: Ledger_baseId_equipmentAssetId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_baseId_equipmentAssetId_createdAt_idx" ON public."Ledger" USING btree ("baseId", "equipmentAssetId", "createdAt");


--
-- Name: Ledger_baseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_baseId_idx" ON public."Ledger" USING btree ("baseId");


--
-- Name: Ledger_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_createdAt_idx" ON public."Ledger" USING btree ("createdAt");


--
-- Name: Ledger_createdById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_createdById_idx" ON public."Ledger" USING btree ("createdById");


--
-- Name: Ledger_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_equipmentAssetId_idx" ON public."Ledger" USING btree ("equipmentAssetId");


--
-- Name: Ledger_expenditureId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_expenditureId_idx" ON public."Ledger" USING btree ("expenditureId");


--
-- Name: Ledger_movementType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_movementType_idx" ON public."Ledger" USING btree ("movementType");


--
-- Name: Ledger_purchaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_purchaseId_idx" ON public."Ledger" USING btree ("purchaseId");


--
-- Name: Ledger_transferId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ledger_transferId_idx" ON public."Ledger" USING btree ("transferId");


--
-- Name: Maintenance_completedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Maintenance_completedById_idx" ON public."Maintenance" USING btree ("completedById");


--
-- Name: Maintenance_createdById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Maintenance_createdById_idx" ON public."Maintenance" USING btree ("createdById");


--
-- Name: Maintenance_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Maintenance_equipmentAssetId_idx" ON public."Maintenance" USING btree ("equipmentAssetId");


--
-- Name: Maintenance_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Maintenance_isActive_idx" ON public."Maintenance" USING btree ("isActive");


--
-- Name: Maintenance_maintenanceType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Maintenance_maintenanceType_idx" ON public."Maintenance" USING btree ("maintenanceType");


--
-- Name: Maintenance_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Maintenance_status_idx" ON public."Maintenance" USING btree (status);


--
-- Name: MovementHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MovementHistory_createdAt_idx" ON public."MovementHistory" USING btree ("createdAt");


--
-- Name: MovementHistory_destinationBaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MovementHistory_destinationBaseId_idx" ON public."MovementHistory" USING btree ("destinationBaseId");


--
-- Name: MovementHistory_equipmentAssetId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MovementHistory_equipmentAssetId_createdAt_idx" ON public."MovementHistory" USING btree ("equipmentAssetId", "createdAt");


--
-- Name: MovementHistory_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MovementHistory_equipmentAssetId_idx" ON public."MovementHistory" USING btree ("equipmentAssetId");


--
-- Name: MovementHistory_movementType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MovementHistory_movementType_idx" ON public."MovementHistory" USING btree ("movementType");


--
-- Name: MovementHistory_performedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MovementHistory_performedById_idx" ON public."MovementHistory" USING btree ("performedById");


--
-- Name: MovementHistory_referenceType_referenceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MovementHistory_referenceType_referenceId_idx" ON public."MovementHistory" USING btree ("referenceType", "referenceId");


--
-- Name: MovementHistory_sourceBaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MovementHistory_sourceBaseId_idx" ON public."MovementHistory" USING btree ("sourceBaseId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_isRead_idx" ON public."Notification" USING btree ("isRead");


--
-- Name: Notification_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_type_idx" ON public."Notification" USING btree (type);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: OrganizationUnit_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OrganizationUnit_code_key" ON public."OrganizationUnit" USING btree (code);


--
-- Name: OrganizationUnit_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrganizationUnit_level_idx" ON public."OrganizationUnit" USING btree (level);


--
-- Name: OrganizationUnit_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrganizationUnit_parentId_idx" ON public."OrganizationUnit" USING btree ("parentId");


--
-- Name: Personnel_serviceNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Personnel_serviceNumber_idx" ON public."Personnel" USING btree ("serviceNumber");


--
-- Name: Personnel_serviceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Personnel_serviceNumber_key" ON public."Personnel" USING btree ("serviceNumber");


--
-- Name: Personnel_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Personnel_status_idx" ON public."Personnel" USING btree (status);


--
-- Name: Personnel_unitId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Personnel_unitId_idx" ON public."Personnel" USING btree ("unitId");


--
-- Name: ProcurementItem_equipmentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProcurementItem_equipmentId_idx" ON public."ProcurementItem" USING btree ("equipmentId");


--
-- Name: ProcurementItem_procurementId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProcurementItem_procurementId_idx" ON public."ProcurementItem" USING btree ("procurementId");


--
-- Name: Procurement_baseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Procurement_baseId_idx" ON public."Procurement" USING btree ("baseId");


--
-- Name: Procurement_procurementNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Procurement_procurementNumber_key" ON public."Procurement" USING btree ("procurementNumber");


--
-- Name: Procurement_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Procurement_status_idx" ON public."Procurement" USING btree (status);


--
-- Name: Procurement_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Procurement_supplierId_idx" ON public."Procurement" USING btree ("supplierId");


--
-- Name: Purchase_baseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Purchase_baseId_idx" ON public."Purchase" USING btree ("baseId");


--
-- Name: Purchase_equipmentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Purchase_equipmentId_idx" ON public."Purchase" USING btree ("equipmentId");


--
-- Name: Purchase_purchasedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Purchase_purchasedAt_idx" ON public."Purchase" USING btree ("purchasedAt");


--
-- Name: Purchase_purchasedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Purchase_purchasedById_idx" ON public."Purchase" USING btree ("purchasedById");


--
-- Name: ReportJob_requestedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReportJob_requestedAt_idx" ON public."ReportJob" USING btree ("requestedAt");


--
-- Name: ReportJob_requestedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReportJob_requestedById_idx" ON public."ReportJob" USING btree ("requestedById");


--
-- Name: ReportJob_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReportJob_status_idx" ON public."ReportJob" USING btree (status);


--
-- Name: Supplier_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Supplier_code_key" ON public."Supplier" USING btree (code);


--
-- Name: Supplier_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Supplier_status_idx" ON public."Supplier" USING btree (status);


--
-- Name: Transfer_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transfer_equipmentAssetId_idx" ON public."Transfer" USING btree ("equipmentAssetId");


--
-- Name: Transfer_fromBaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transfer_fromBaseId_idx" ON public."Transfer" USING btree ("fromBaseId");


--
-- Name: Transfer_toBaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transfer_toBaseId_idx" ON public."Transfer" USING btree ("toBaseId");


--
-- Name: Transfer_transferredById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transfer_transferredById_idx" ON public."Transfer" USING btree ("transferredById");


--
-- Name: User_baseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_baseId_idx" ON public."User" USING btree ("baseId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Warranty_endDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Warranty_endDate_idx" ON public."Warranty" USING btree ("endDate");


--
-- Name: Warranty_equipmentAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Warranty_equipmentAssetId_idx" ON public."Warranty" USING btree ("equipmentAssetId");


--
-- Name: Warranty_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Warranty_status_idx" ON public."Warranty" USING btree (status);


--
-- Name: AssetValuation AssetValuation_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssetValuation"
    ADD CONSTRAINT "AssetValuation_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Assignment Assignment_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Assignment Assignment_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Assignment Assignment_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Assignment Assignment_personnelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES public."Personnel"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Assignment Assignment_returnedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Attachment Attachment_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attachment"
    ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DepreciationHistory DepreciationHistory_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepreciationHistory"
    ADD CONSTRAINT "DepreciationHistory_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Disposal Disposal_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Disposal"
    ADD CONSTRAINT "Disposal_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Disposal Disposal_disposedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Disposal"
    ADD CONSTRAINT "Disposal_disposedById_fkey" FOREIGN KEY ("disposedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Disposal Disposal_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Disposal"
    ADD CONSTRAINT "Disposal_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EquipmentAsset EquipmentAsset_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EquipmentAsset"
    ADD CONSTRAINT "EquipmentAsset_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EquipmentAsset EquipmentAsset_equipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EquipmentAsset"
    ADD CONSTRAINT "EquipmentAsset_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES public."Equipment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EquipmentAsset EquipmentAsset_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EquipmentAsset"
    ADD CONSTRAINT "EquipmentAsset_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."OrganizationUnit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Equipment Equipment_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "Equipment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expenditure Expenditure_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expenditure"
    ADD CONSTRAINT "Expenditure_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Expenditure Expenditure_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expenditure"
    ADD CONSTRAINT "Expenditure_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Expenditure Expenditure_expendedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expenditure"
    ADD CONSTRAINT "Expenditure_expendedById_fkey" FOREIGN KEY ("expendedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inspection Inspection_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inspection"
    ADD CONSTRAINT "Inspection_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inspection Inspection_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inspection"
    ADD CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_equipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES public."Equipment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ledger Ledger_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."Assignment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ledger Ledger_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ledger Ledger_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ledger Ledger_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ledger Ledger_expenditureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_expenditureId_fkey" FOREIGN KEY ("expenditureId") REFERENCES public."Expenditure"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ledger Ledger_purchaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES public."Purchase"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ledger Ledger_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ledger"
    ADD CONSTRAINT "Ledger_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public."Transfer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Maintenance Maintenance_completedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Maintenance"
    ADD CONSTRAINT "Maintenance_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Maintenance Maintenance_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Maintenance"
    ADD CONSTRAINT "Maintenance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Maintenance Maintenance_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Maintenance"
    ADD CONSTRAINT "Maintenance_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MovementHistory MovementHistory_destinationBaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovementHistory"
    ADD CONSTRAINT "MovementHistory_destinationBaseId_fkey" FOREIGN KEY ("destinationBaseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MovementHistory MovementHistory_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovementHistory"
    ADD CONSTRAINT "MovementHistory_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MovementHistory MovementHistory_performedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovementHistory"
    ADD CONSTRAINT "MovementHistory_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MovementHistory MovementHistory_sourceBaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovementHistory"
    ADD CONSTRAINT "MovementHistory_sourceBaseId_fkey" FOREIGN KEY ("sourceBaseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrganizationUnit OrganizationUnit_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUnit"
    ADD CONSTRAINT "OrganizationUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."OrganizationUnit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Personnel Personnel_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Personnel"
    ADD CONSTRAINT "Personnel_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."OrganizationUnit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProcurementItem ProcurementItem_equipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProcurementItem"
    ADD CONSTRAINT "ProcurementItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES public."Equipment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProcurementItem ProcurementItem_procurementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProcurementItem"
    ADD CONSTRAINT "ProcurementItem_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES public."Procurement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Procurement Procurement_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Procurement"
    ADD CONSTRAINT "Procurement_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Procurement Procurement_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Procurement"
    ADD CONSTRAINT "Procurement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Procurement Procurement_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Procurement"
    ADD CONSTRAINT "Procurement_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Purchase Purchase_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Purchase Purchase_equipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES public."Equipment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Purchase Purchase_purchasedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_purchasedById_fkey" FOREIGN KEY ("purchasedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReportJob ReportJob_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReportJob"
    ADD CONSTRAINT "ReportJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transfer Transfer_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transfer Transfer_fromBaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_fromBaseId_fkey" FOREIGN KEY ("fromBaseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transfer Transfer_toBaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_toBaseId_fkey" FOREIGN KEY ("toBaseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transfer Transfer_transferredById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_transferredById_fkey" FOREIGN KEY ("transferredById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Warranty Warranty_equipmentAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Warranty"
    ADD CONSTRAINT "Warranty_equipmentAssetId_fkey" FOREIGN KEY ("equipmentAssetId") REFERENCES public."EquipmentAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Warranty Warranty_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Warranty"
    ADD CONSTRAINT "Warranty_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict Q4D1nJrSlqcF9pZ5zLebm6GUl7Km2XJrD12Cj2iv8S798w6liujrweVmEHkI0aH

