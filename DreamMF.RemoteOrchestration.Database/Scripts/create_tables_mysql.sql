-- MySQL script to create tables based on the entities

DROP VIEW IF EXISTS v_RemoteReadAnalytics;
DROP VIEW IF EXISTS v_HostReadAnalytics;
DROP VIEW IF EXISTS v_DailyHostReads;
DROP VIEW IF EXISTS v_DailyRemoteReads;
DROP TABLE IF EXISTS demo;
DROP TABLE IF EXISTS Host_Remote;
DROP TABLE IF EXISTS Tags_Host;
DROP TABLE IF EXISTS Tags_Remote;
DROP TABLE IF EXISTS Audit_Host;
DROP TABLE IF EXISTS Audit_Remote;
DROP TABLE IF EXISTS AuditReads_Host;
DROP TABLE IF EXISTS AuditReads_Remote;
DROP TABLE IF EXISTS Remote_Module;
DROP TABLE IF EXISTS Host;
DROP TABLE IF EXISTS Remote;
DROP TABLE IF EXISTS Tag;
DROP TABLE IF EXISTS Module;
DROP TABLE IF EXISTS Configuration;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS Version;
DROP TABLE IF EXISTS __EFMigrationsHistory;

CREATE TABLE __EFMigrationsHistory (
    MigrationId VARCHAR(150) NOT NULL PRIMARY KEY,
    ProductVersion VARCHAR(32) NOT NULL
);

CREATE TABLE Version (
    Version_ID INT AUTO_INCREMENT PRIMARY KEY,
    Remote_ID INT,
    Value VARCHAR(255) NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL
);

CREATE TABLE Audit_Remote (
    Audit_ID INT AUTO_INCREMENT PRIMARY KEY,
    Remote_ID INT,
    `Change` VARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date TIMESTAMP NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

-- Optimized audit reads tables with appropriate indexes
CREATE TABLE AuditReads_Host (
    AuditRead_ID INT AUTO_INCREMENT PRIMARY KEY,
    Host_ID INT NOT NULL,
    Action VARCHAR(50) NOT NULL,
    User_ID INT NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID)
);

CREATE INDEX idx_auditreads_host_hostid ON AuditReads_Host(Host_ID);
CREATE INDEX idx_auditreads_host_date ON AuditReads_Host(Created_Date);
CREATE INDEX idx_auditreads_host_action ON AuditReads_Host(Action);

CREATE TABLE AuditReads_Remote (
    AuditRead_ID INT AUTO_INCREMENT PRIMARY KEY,
    Remote_ID INT NOT NULL,
    Action VARCHAR(50) NOT NULL,
    User_ID INT NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

CREATE INDEX idx_auditreads_remote_remoteid ON AuditReads_Remote(Remote_ID);
CREATE INDEX idx_auditreads_remote_date ON AuditReads_Remote(Created_Date);
CREATE INDEX idx_auditreads_remote_action ON AuditReads_Remote(Action);

CREATE TABLE Tag (
    Tag_ID INT AUTO_INCREMENT PRIMARY KEY,
    `Key` VARCHAR(255) NOT NULL,
    Display_Name VARCHAR(500) NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL
);

CREATE TABLE Module (
    Module_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL
);

CREATE TABLE Audit_Host (
    Audit_ID INT AUTO_INCREMENT PRIMARY KEY,
    Host_ID INT,
    `Change` VARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date TIMESTAMP NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID)
);

CREATE TABLE `User` (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Auth_Provider VARCHAR(255) NOT NULL,
    Auth_User_ID VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL
);

CREATE TABLE Host (
    Host_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Url VARCHAR(255) NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    `Key` VARCHAR(255) NOT NULL,
    Environment VARCHAR(255) NOT NULL,
    Repository VARCHAR(255),
    Contact_Name VARCHAR(255),
    Contact_Email VARCHAR(255),
    Documentation_Url VARCHAR(255),
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL
);

CREATE TABLE Remote (
    Remote_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    `Key` VARCHAR(255) NOT NULL,
    Scope VARCHAR(255) NOT NULL,
    Repository VARCHAR(255),
    Contact_Name VARCHAR(255),
    Contact_Email VARCHAR(255),
    Documentation_Url VARCHAR(255),
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL
);

CREATE TABLE Remote_Module (
    Remote_Module_ID INT AUTO_INCREMENT PRIMARY KEY,
    Remote_ID INT NOT NULL,
    Module_ID INT NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID),
    FOREIGN KEY (Module_ID) REFERENCES Module(Module_ID)
);

CREATE TABLE Host_Remote (
    Host_Remote_ID INT AUTO_INCREMENT PRIMARY KEY,
    Host_ID INT,
    Remote_ID INT,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID),
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

CREATE TABLE Tags_Host (
    Tag_Host_ID INT AUTO_INCREMENT PRIMARY KEY,
    Host_ID INT,
    Tag_ID INT,
    `Value` VARCHAR(500) NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID),
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID)
);

CREATE TABLE Tags_Remote (
    Tag_Remote_ID INT AUTO_INCREMENT PRIMARY KEY,
    Remote_ID INT,
    Tag_ID INT,
    `Value` VARCHAR(500) NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID),
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID)
);

CREATE TABLE Configuration (
    Configuration_ID INT AUTO_INCREMENT PRIMARY KEY,
    `Key` VARCHAR(500) NOT NULL,
    `Value` VARCHAR(1000) NOT NULL,
    Created_Date TIMESTAMP NOT NULL,
    Updated_Date TIMESTAMP NOT NULL
);

-- Insert default tags
INSERT INTO Tag (`Key`, Display_Name, Created_Date, Updated_Date)
VALUES 
    ('Technology', 'Main Technology', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('Language', 'Programming Language', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('Framework', 'Framework', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('TeamName', 'Team or Project Name', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('Department', 'Department or Team', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('Organization', 'Organization Name', '2024-12-23 08:49:27', '2024-12-23 08:49:27');

-- Insert default configuration settings
INSERT INTO Configuration (`Key`, `Value`, Created_Date, Updated_Date)
VALUES 
    -- Storage Settings
    ('storage:type', 'local', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('storage:azure:container_name', '', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('storage:azure:blob_name', '', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('storage:aws:bucket_name', '', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('storage:aws:bucket_key', '', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    
    -- Database Settings
    ('database:type', 'mysql', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('database:host', 'localhost', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('database:port', '3306', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('database:name', '', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('database:user', '', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('database:password', '', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    
    -- API Settings
    ('api:base_url', 'http://localhost:5000', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('api:version', 'v1', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('api:timeout', '30000', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    
    -- Application Settings
    ('app:name', 'Dream Remote Orchestration Services', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('app:environment', 'development', '2024-12-23 08:49:27', '2024-12-23 08:49:27'),
    ('app:debug_mode', 'false', '2024-12-23 08:49:27', '2024-12-23 08:49:27');

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
        WHEN ar.Created_Date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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
        WHEN ar.Created_Date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        THEN 1 
    END) as Last30DaysActions
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY h.Host_ID, h.Name;

-- View for daily Host reads
CREATE VIEW v_DailyHostReads AS
SELECT 
    DATE(ar.Created_Date) as ReadDate,
    h.Host_ID,
    h.Name as HostName,
    COUNT(*) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as ReadCount,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as UpdateCount,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as CreateCount,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as DeleteCount
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY DATE(ar.Created_Date), h.Host_ID, h.Name
ORDER BY ReadDate DESC;

-- View for daily Remote reads
CREATE VIEW v_DailyRemoteReads AS
SELECT 
    DATE(ar.Created_Date) as ReadDate,
    r.Remote_ID,
    r.Name as RemoteName,
    COUNT(*) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as ReadCount,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as UpdateCount,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as CreateCount,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as DeleteCount
FROM Remote r
LEFT JOIN AuditReads_Remote ar ON r.Remote_ID = ar.Remote_ID
GROUP BY DATE(ar.Created_Date), r.Remote_ID, r.Name
ORDER BY ReadDate DESC;
