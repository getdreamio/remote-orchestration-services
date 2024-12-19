-- SQL script to create tables based on the entities

DROP VIEW IF EXISTS v_RemoteReadAnalytics;
DROP VIEW IF EXISTS v_HostReadAnalytics;
DROP VIEW IF EXISTS v_DailyHostReads;
DROP VIEW IF EXISTS v_DailyRemoteReads;
DROP TABLE IF EXISTS demo;
DROP TABLE IF EXISTS Host;
DROP TABLE IF EXISTS Remote;
DROP TABLE IF EXISTS Tag;
DROP TABLE IF EXISTS Module;
DROP TABLE IF EXISTS Remote_Module;
DROP TABLE IF EXISTS Configuration;
DROP TABLE IF EXISTS [User];
DROP TABLE IF EXISTS Version;
DROP TABLE IF EXISTS Host_Remote;
DROP TABLE IF EXISTS Tags_Host;
DROP TABLE IF EXISTS Tags_Remote;
DROP TABLE IF EXISTS Audit_Host;
DROP TABLE IF EXISTS Audit_Remote;
DROP TABLE IF EXISTS AuditReads_Host;
DROP TABLE IF EXISTS AuditReads_Remote;
DROP TABLE IF EXISTS __EFMigrationsHistory;

CREATE TABLE __EFMigrationsHistory (
    MigrationId VARCHAR(150) NOT NULL PRIMARY KEY,
    ProductVersion VARCHAR(32) NOT NULL
);

CREATE TABLE Version (
    Version_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT,
    Value VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Audit_Remote (
    Audit_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT,
    Change VARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

-- Optimized audit reads tables with appropriate indexes
CREATE TABLE AuditReads_Host (
    AuditRead_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Host_ID INT NOT NULL,
    Action VARCHAR(50) NOT NULL, -- Reduced size since we have limited action types
    User_ID INT NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID)
);

CREATE INDEX idx_auditreads_host_hostid ON AuditReads_Host(Host_ID);
CREATE INDEX idx_auditreads_host_date ON AuditReads_Host(Created_Date);
CREATE INDEX idx_auditreads_host_action ON AuditReads_Host(Action);

CREATE TABLE AuditReads_Remote (
    AuditRead_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT NOT NULL,
    Action VARCHAR(50) NOT NULL, -- Reduced size since we have limited action types
    User_ID INT NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

CREATE INDEX idx_auditreads_remote_remoteid ON AuditReads_Remote(Remote_ID);
CREATE INDEX idx_auditreads_remote_date ON AuditReads_Remote(Created_Date);
CREATE INDEX idx_auditreads_remote_action ON AuditReads_Remote(Action);

CREATE TABLE Tag (
    Tag_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Text VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Module (
    Module_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Audit_Host (
    Audit_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Host_ID INT,
    Change VARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID)
);

CREATE TABLE [User] (
    User_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Auth_Provider VARCHAR(255) NOT NULL,
    Auth_User_ID VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Host (
    Host_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL,
    Url VARCHAR(255) NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    [Key] VARCHAR(255) NOT NULL,
    Environment VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Remote (
    Remote_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL,
    Scope VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Remote_Module (
    Remote_Module_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT NOT NULL,
    Module_ID INT NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID),
    FOREIGN KEY (Module_ID) REFERENCES Module(Module_ID)
);

CREATE TABLE Host_Remote (
    Host_Remote_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Host_ID INT,
    Remote_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID),
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

CREATE TABLE Tags_Host (
    Tag_Host_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Host_ID INT,
    Tag_ID INT,
    [Value] VARCHAR(500) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID),
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID)
);

CREATE TABLE Tags_Remote (
    Tag_Remote_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT,
    Tag_ID INT,
    [Value] VARCHAR(500) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID),
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID)
);

CREATE TABLE Configuration
(
    [Configuration_ID] INTEGER PRIMARY KEY AUTOINCREMENT,
    [Key] VARCHAR(500) NOT NULL,
    [Value] VARCHAR(1000) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

-- Insert default tags
INSERT INTO Tag (Text, Created_Date, Updated_Date)
VALUES 
    ('Technology', '2024-12-19T09:11:35-07:00', '2024-12-19T09:11:35-07:00'),
    ('Language', '2024-12-19T09:11:35-07:00', '2024-12-19T09:11:35-07:00'),
    ('Framework', '2024-12-19T09:11:35-07:00', '2024-12-19T09:11:35-07:00'),
    ('TeamName', '2024-12-19T09:11:35-07:00', '2024-12-19T09:11:35-07:00'),
    ('Department', '2024-12-19T09:11:35-07:00', '2024-12-19T09:11:35-07:00'),
    ('Organization', '2024-12-19T09:11:35-07:00', '2024-12-19T09:11:35-07:00');

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
        WHEN ar.Created_Date >= datetime('now', '-30 days') 
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
        WHEN ar.Created_Date >= datetime('now', '-30 days') 
        THEN 1 
    END) as Last30DaysActions
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY h.Host_ID, h.Name;

-- View for daily Host reads
CREATE VIEW v_DailyHostReads AS
SELECT 
    date(ar.Created_Date) as ReadDate,
    h.Host_ID,
    h.Name as HostName,
    COUNT(*) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as ReadCount,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as UpdateCount,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as CreateCount,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as DeleteCount
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY date(ar.Created_Date), h.Host_ID, h.Name
ORDER BY ReadDate DESC;

-- View for daily Remote reads
CREATE VIEW v_DailyRemoteReads AS
SELECT 
    date(ar.Created_Date) as ReadDate,
    r.Remote_ID,
    r.Name as RemoteName,
    COUNT(*) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as ReadCount,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as UpdateCount,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as CreateCount,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as DeleteCount
FROM Remote r
LEFT JOIN AuditReads_Remote ar ON r.Remote_ID = ar.Remote_ID
GROUP BY date(ar.Created_Date), r.Remote_ID, r.Name
ORDER BY ReadDate DESC;
