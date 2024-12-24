-- SQL Server script to create tables based on the entities

IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_RemoteReadAnalytics') DROP VIEW v_RemoteReadAnalytics;
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_HostReadAnalytics') DROP VIEW v_HostReadAnalytics;
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_DailyHostReads') DROP VIEW v_DailyHostReads;
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_DailyRemoteReads') DROP VIEW v_DailyRemoteReads;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'demo') DROP TABLE demo;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Host') DROP TABLE Host;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Remote') DROP TABLE Remote;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Tag') DROP TABLE Tag;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Module') DROP TABLE Module;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Remote_Module') DROP TABLE Remote_Module;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Configuration') DROP TABLE Configuration;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'User') DROP TABLE [User];
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Version') DROP TABLE Version;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Host_Remote') DROP TABLE Host_Remote;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Tags_Host') DROP TABLE Tags_Host;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Tags_Remote') DROP TABLE Tags_Remote;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Audit_Host') DROP TABLE Audit_Host;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Audit_Remote') DROP TABLE Audit_Remote;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditReads_Host') DROP TABLE AuditReads_Host;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditReads_Remote') DROP TABLE AuditReads_Remote;
IF EXISTS (SELECT * FROM sys.tables WHERE name = '__EFMigrationsHistory') DROP TABLE __EFMigrationsHistory;

CREATE TABLE __EFMigrationsHistory (
    MigrationId NVARCHAR(150) NOT NULL PRIMARY KEY,
    ProductVersion NVARCHAR(32) NOT NULL
);

CREATE TABLE Version (
    Version_ID INT IDENTITY(1,1) PRIMARY KEY,
    Remote_ID INT,
    Value NVARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Audit_Remote (
    Audit_ID INT IDENTITY(1,1) PRIMARY KEY,
    Remote_ID INT,
    Change NVARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

-- Optimized audit reads tables with appropriate indexes
CREATE TABLE AuditReads_Host (
    AuditRead_ID INT IDENTITY(1,1) PRIMARY KEY,
    Host_ID INT NOT NULL,
    Action NVARCHAR(50) NOT NULL,
    User_ID INT NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID)
);

CREATE INDEX idx_auditreads_host_hostid ON AuditReads_Host(Host_ID);
CREATE INDEX idx_auditreads_host_date ON AuditReads_Host(Created_Date);
CREATE INDEX idx_auditreads_host_action ON AuditReads_Host(Action);

CREATE TABLE AuditReads_Remote (
    AuditRead_ID INT IDENTITY(1,1) PRIMARY KEY,
    Remote_ID INT NOT NULL,
    Action NVARCHAR(50) NOT NULL,
    User_ID INT NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

CREATE INDEX idx_auditreads_remote_remoteid ON AuditReads_Remote(Remote_ID);
CREATE INDEX idx_auditreads_remote_date ON AuditReads_Remote(Created_Date);
CREATE INDEX idx_auditreads_remote_action ON AuditReads_Remote(Action);

CREATE TABLE Tag (
    Tag_ID INT IDENTITY(1,1) PRIMARY KEY,
    [Key] NVARCHAR(255) NOT NULL,
    Display_Name NVARCHAR(500) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Module (
    Module_ID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Audit_Host (
    Audit_ID INT IDENTITY(1,1) PRIMARY KEY,
    Host_ID INT,
    Change NVARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID)
);

CREATE TABLE [User] (
    User_ID INT IDENTITY(1,1) PRIMARY KEY,
    Auth_Provider NVARCHAR(255) NOT NULL,
    Auth_User_ID NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Host (
    Host_ID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Url NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    [Key] NVARCHAR(255) NOT NULL,
    Environment NVARCHAR(255) NOT NULL,
    Repository NVARCHAR(255),
    Contact_Name NVARCHAR(255),
    Contact_Email NVARCHAR(255),
    Documentation_Url NVARCHAR(255),
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Remote (
    Remote_ID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    [Key] NVARCHAR(255) NOT NULL,
    Scope NVARCHAR(255) NOT NULL,
    Repository NVARCHAR(255),
    Contact_Name NVARCHAR(255),
    Contact_Email NVARCHAR(255),
    Documentation_Url NVARCHAR(255),
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Remote_Module (
    Remote_Module_ID INT IDENTITY(1,1) PRIMARY KEY,
    Remote_ID INT NOT NULL,
    Module_ID INT NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID),
    FOREIGN KEY (Module_ID) REFERENCES Module(Module_ID)
);

CREATE TABLE Host_Remote (
    Host_Remote_ID INT IDENTITY(1,1) PRIMARY KEY,
    Host_ID INT,
    Remote_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID),
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

CREATE TABLE Tags_Host (
    Tag_Host_ID INT IDENTITY(1,1) PRIMARY KEY,
    Host_ID INT,
    Tag_ID INT,
    [Value] NVARCHAR(500) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID),
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID)
);

CREATE TABLE Tags_Remote (
    Tag_Remote_ID INT IDENTITY(1,1) PRIMARY KEY,
    Remote_ID INT,
    Tag_ID INT,
    [Value] NVARCHAR(500) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID),
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID)
);

CREATE TABLE Configuration (
    Configuration_ID INT IDENTITY(1,1) PRIMARY KEY,
    [Key] NVARCHAR(500) NOT NULL,
    [Value] NVARCHAR(1000) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

-- Insert default tags
INSERT INTO Tag ([Key], Display_Name, Created_Date, Updated_Date)
VALUES 
    ('Technology', 'Main Technology', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('Language', 'Programming Language', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('Framework', 'Framework', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('TeamName', 'Team or Project Name', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('Department', 'Department or Team', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('Organization', 'Organization Name', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00');

-- Insert default configuration settings
INSERT INTO Configuration ([Key], [Value], Created_Date, Updated_Date)
VALUES 
    -- Storage Settings
    ('storage:type', 'local', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('storage:azure:container_name', '', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('storage:azure:blob_name', '', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('storage:aws:bucket_name', '', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('storage:aws:bucket_key', '', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    
    -- Database Settings
    ('database:type', 'sqlserver', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('database:host', 'localhost\\SQLEXPRESS', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('database:port', '1433', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('database:name', '', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('database:user', '', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('database:password', '', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    
    -- API Settings
    ('api:base_url', 'http://localhost:5000', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('api:version', 'v1', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('api:timeout', '30000', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    
    -- Application Settings
    ('app:name', 'Dream Remote Orchestration Services', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('app:environment', 'development', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00'),
    ('app:debug_mode', 'false', '2024-12-23T08:49:27-07:00', '2024-12-23T08:49:27-07:00');

-- Analytics Views

-- View for Remote read/update analytics
CREATE VIEW v_RemoteReadAnalytics AS
SELECT 
    r.Remote_ID,
    r.Name as RemoteName,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as TotalUpdates,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as TotalCreates,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as TotalDeletes,
    COUNT(CASE 
        WHEN ar.Created_Date >= DATEADD(day, -30, GETDATE())
        THEN 1 
    END) as Last30DaysActions
FROM Remote r
LEFT JOIN AuditReads_Remote ar ON r.Remote_ID = ar.Remote_ID
GROUP BY r.Remote_ID, r.Name;

-- View for Host read/update analytics
CREATE VIEW v_HostReadAnalytics AS
SELECT 
    h.Host_ID,
    h.Name as HostName,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as TotalUpdates,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as TotalCreates,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as TotalDeletes,
    COUNT(CASE 
        WHEN ar.Created_Date >= DATEADD(day, -30, GETDATE())
        THEN 1 
    END) as Last30DaysActions
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY h.Host_ID, h.Name;

-- View for daily Host reads
CREATE VIEW v_DailyHostReads AS
SELECT 
    CAST(ar.Created_Date AS DATE) as ReadDate,
    h.Host_ID,
    h.Name as HostName,
    COUNT(*) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as ReadCount,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as UpdateCount,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as CreateCount,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as DeleteCount
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY CAST(ar.Created_Date AS DATE), h.Host_ID, h.Name
ORDER BY ReadDate DESC;

-- View for daily Remote reads
CREATE VIEW v_DailyRemoteReads AS
SELECT 
    CAST(ar.Created_Date AS DATE) as ReadDate,
    r.Remote_ID,
    r.Name as RemoteName,
    COUNT(*) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as ReadCount,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as UpdateCount,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as CreateCount,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as DeleteCount
FROM Remote r
LEFT JOIN AuditReads_Remote ar ON r.Remote_ID = ar.Remote_ID
GROUP BY CAST(ar.Created_Date AS DATE), r.Remote_ID, r.Name
ORDER BY ReadDate DESC;
