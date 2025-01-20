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
DROP TABLE IF EXISTS UserRoleMapping;
DROP TABLE IF EXISTS UserRole;
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

-- User Management Tables
CREATE TABLE [User] (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Email VARCHAR(255) NOT NULL,
    DisplayName VARCHAR(255) NOT NULL,
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    ProfilePictureUrl VARCHAR(1000),
    AuthProvider INTEGER NOT NULL,  -- Enum: 0=Local, 1=Google, 2=GitHub, 3=Microsoft, 4=Custom
    AuthUserId VARCHAR(255) NOT NULL,
    PasswordHash VARCHAR(255),
    PasswordSalt VARCHAR(255) NULL,  -- Made nullable since salt is included in BCrypt hash
    IsEmailVerified BOOLEAN NOT NULL DEFAULT 0,
    EmailVerificationToken VARCHAR(255),
    EmailVerificationTokenExpiry INTEGER,  -- Unix timestamp
    AccessToken VARCHAR(1000),
    RefreshToken VARCHAR(1000),
    TokenExpiry INTEGER,  -- Unix timestamp
    ProviderMetadata TEXT,  -- JSON string
    IsTwoFactorEnabled BOOLEAN NOT NULL DEFAULT 0,
    TwoFactorSecret VARCHAR(255),
    BackupCodes TEXT,  -- JSON array
    Status INTEGER NOT NULL,  -- Enum: 0=Active, 1=Inactive, 2=Suspended, 3=PendingVerification
    LastLoginDate INTEGER,  -- Unix timestamp
    LastLoginIp VARCHAR(45),
    FailedLoginAttempts INTEGER NOT NULL DEFAULT 0,
    LockoutEnd INTEGER,  -- Unix timestamp
    CreatedDate INTEGER NOT NULL,  -- Unix timestamp
    UpdatedDate INTEGER NOT NULL  -- Unix timestamp
);

CREATE TABLE UserRole (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL,
    NormalizedName VARCHAR(255) NOT NULL,
    Description VARCHAR(1000),
    CreatedDate INTEGER NOT NULL,  -- Unix timestamp
    UpdatedDate INTEGER NOT NULL  -- Unix timestamp
);

CREATE TABLE UserRoleMapping (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    RoleId INTEGER NOT NULL,
    CreatedDate INTEGER NOT NULL,  -- Unix timestamp
    FOREIGN KEY (UserId) REFERENCES [User](Id) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES UserRole(Id) ON DELETE CASCADE
);

-- Indexes for User Management
CREATE UNIQUE INDEX idx_user_email ON [User](Email);
CREATE INDEX idx_user_auth ON [User](AuthProvider, AuthUserId);
CREATE INDEX idx_user_status ON [User](Status);
CREATE INDEX idx_user_lastlogin ON [User](LastLoginDate);
CREATE UNIQUE INDEX idx_userrole_normalizedname ON UserRole(NormalizedName);
CREATE INDEX idx_userrolemapping_user ON UserRoleMapping(UserId);
CREATE INDEX idx_userrolemapping_role ON UserRoleMapping(RoleId);

-- Default Roles
INSERT INTO UserRole (Name, NormalizedName, Description, CreatedDate, UpdatedDate)
VALUES 
    ('Administrator', 'ADMIN', 'Full system access', strftime('%s','now'), strftime('%s','now')),
    ('CanCreateEditHosts', 'CANCREATEEDITHOSTS', 'Can create/edit hosts', strftime('%s','now'), strftime('%s','now')),
    ('CanCreateEditRemotes', 'CANCREATEEDITREMOTES', 'Can create/edit remotes', strftime('%s','now'), strftime('%s','now')),
    ('CanCreateEditTags', 'CANCREATEEDITTAGS', 'Can create/edit tags', strftime('%s','now'), strftime('%s','now'));

-- Root User (Password: Dr34m!12345)
INSERT INTO [User] (
    Email,
    DisplayName,
    FirstName,
    LastName,
    AuthProvider,
    AuthUserId,
    PasswordHash,
    PasswordSalt,
    IsEmailVerified,
    Status,
    CreatedDate,
    UpdatedDate
) VALUES (
    'root@dreammf.com',
    'Root Admin',
    'Root',
    'Admin',
    0,  -- Local auth
    'root',
    '$2a$11$YphTg003gvjvLjEb/94z8uPpPOfgU48up7uDpC8if1xFXd.stCuS.',  -- BCrypt hash for Dr34m!12345
    '$2a$11$6z88zhP288F5Lh7y44/mte',  -- Salt is included in the hash
    1,  -- Email verified
    0,  -- Active
    strftime('%s','now'),  -- Current timestamp
    strftime('%s','now')  -- Current timestamp
);

-- Assign Admin role to root user
INSERT INTO UserRoleMapping (UserId, RoleId, CreatedDate)
SELECT u.Id, r.Id, strftime('%s','now')
FROM [User] u, UserRole r
WHERE u.Email = 'root@dreammf.com' AND r.NormalizedName = 'ADMIN';

CREATE TABLE Version (
    Version_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT,
    Value VARCHAR(255) NOT NULL,
    Url VARCHAR(1000),
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL
);

CREATE TABLE Audit_Remote (
    Audit_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT,
    Change VARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date INTEGER NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

-- Optimized audit reads tables with appropriate indexes
CREATE TABLE AuditReads_Host (
    AuditRead_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Host_ID INT NOT NULL,
    Action VARCHAR(50) NOT NULL, -- Reduced size since we have limited action types
    User_ID INT NOT NULL,
    Created_Date INTEGER NOT NULL,
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
    Created_Date INTEGER NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

CREATE INDEX idx_auditreads_remote_remoteid ON AuditReads_Remote(Remote_ID);
CREATE INDEX idx_auditreads_remote_date ON AuditReads_Remote(Created_Date);
CREATE INDEX idx_auditreads_remote_action ON AuditReads_Remote(Action);

CREATE TABLE Tag (
    Tag_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    [Key] VARCHAR(255) NOT NULL,
    Display_Name VARCHAR(500) NOT NULL,
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL
);

CREATE TABLE Module (
    Module_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL,
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL
);

CREATE TABLE Audit_Host (
    Audit_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Host_ID INT,
    Change VARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date INTEGER NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID)
);

CREATE TABLE Host (
    Host_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL,
    Url VARCHAR(255) NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    [Key] VARCHAR(255) NOT NULL,
    Environment VARCHAR(255) NOT NULL,
    Repository VARCHAR(255),
    Contact_Name VARCHAR(255),
    Contact_Email VARCHAR(255),
    Documentation_Url VARCHAR(255),
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL
);

CREATE TABLE Remote (
    Remote_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL,
    [Key] VARCHAR(255) NOT NULL,
    Scope VARCHAR(255) NOT NULL,
    Url VARCHAR(1000),
    Repository VARCHAR(255),
    Contact_Name VARCHAR(255),
    Contact_Email VARCHAR(255),
    Documentation_Url VARCHAR(255),
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL
);

CREATE TABLE Remote_Module (
    Remote_Module_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT NOT NULL,
    Module_ID INT NOT NULL,
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID),
    FOREIGN KEY (Module_ID) REFERENCES Module(Module_ID)
);

CREATE TABLE Host_Remote (
    Host_Remote_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Host_ID INT,
    Remote_ID INT,
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID),
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID)
);

CREATE TABLE Tags_Host (
    Tag_Host_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Host_ID INT,
    Tag_ID INT,
    [Value] VARCHAR(500) NOT NULL,
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL,
    FOREIGN KEY (Host_ID) REFERENCES Host(Host_ID),
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID)
);

CREATE TABLE Tags_Remote (
    Tag_Remote_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Remote_ID INT,
    Tag_ID INT,
    [Value] VARCHAR(500) NOT NULL,
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL,
    FOREIGN KEY (Remote_ID) REFERENCES Remote(Remote_ID),
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID)
);

CREATE TABLE Configuration
(
    [Configuration_ID] INTEGER PRIMARY KEY AUTOINCREMENT,
    [Key] VARCHAR(500) NOT NULL,
    [Value] VARCHAR(1000) NOT NULL,
    Created_Date INTEGER NOT NULL,
    Updated_Date INTEGER NOT NULL
);

-- Insert default tags
INSERT INTO Tag ([Key], Display_Name, Created_Date, Updated_Date)
VALUES 
    ('Technology', 'Main Technology', 1671435095, 1671435095),
    ('Language', 'Programming Language', 1671435095, 1671435095),
    ('Framework', 'Framework', 1671435095, 1671435095),
    ('Team Name', 'Team or Project Name', 1671435095, 1671435095),
    ('Department', 'Department or Team', 1671435095, 1671435095),
    ('Organization', 'Organization Name', 1671435095, 1671435095),
    ('Project', 'Project Name or Code', 1671435095, 1671435095);

-- Insert default configuration settings
INSERT INTO Configuration ([Key], [Value], Created_Date, Updated_Date)
VALUES 
    -- Storage Settings
    ('storage:type', 'local', 1671645260, 1671645260),
    ('storage:azure:container_name', '', 1671645260, 1671645260),
    ('storage:azure:blob_name', '', 1671645260, 1671645260),
    ('storage:aws:bucket_name', '', 1671645260, 1671645260),
    ('storage:aws:bucket_key', '', 1671645260, 1671645260),
    
    -- Database Settings
    ('database:type', 'sqlite', 1671645260, 1671645260),
    ('database:filename', 'remote_orchestration.db', 1671645260, 1671645260),
    ('database:host', 'localhost', 1671645260, 1671645260),
    ('database:port', '5432', 1671645260, 1671645260),
    ('database:name', '', 1671645260, 1671645260),
    ('database:user', '', 1671645260, 1671645260),
    ('database:password', '', 1671645260, 1671645260),
    
    -- API Settings
    ('api:base_url', 'http://localhost:5000', 1671645260, 1671645260),
    ('api:version', 'v1', 1671645260, 1671645260),
    ('api:timeout', '30000', 1671645260, 1671645260),
    
    -- Application Settings
    ('app:name', 'Dream Remote Orchestration Services', 1671645260, 1671645260),
    ('app:environment', 'development', 1671645260, 1671645260),
    ('app:debug_mode', 'false', 1671645260, 1671645260);

-- Seed scripts



-- Analytics Views


-- View for Remote read/update analytics
DROP VIEW IF EXISTS v_RemoteReadAnalytics;
CREATE VIEW v_RemoteReadAnalytics AS
SELECT 
	strftime('%Y-%m-%d', datetime(COALESCE(ar.Created_Date, 0) / 1000, 'unixepoch')) as ReadDate,
    r.Remote_ID,
    r.Name as RemoteName,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as TotalUpdates,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as TotalCreates,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as TotalDeletes,
    COUNT(CASE 
        WHEN ar.Created_Date >= strftime('%s', 'now', '-30 days') 
        THEN 1 
    END) as Last30DaysActions,
    COUNT(
        CASE
            WHEN ar.Created_Date >= strftime('%s', 'now', '-24 hour')
            THEN 1
        END
    ) AS Last24HoursActions
FROM Remote r
LEFT JOIN AuditReads_Remote ar ON r.Remote_ID = ar.Remote_ID
GROUP BY r.Remote_ID, r.Name;

-- View for Host read/update analytics
DROP VIEW IF EXISTS v_HostReadAnalytics;
CREATE VIEW v_HostReadAnalytics AS
SELECT 
    strftime('%Y-%m-%d', datetime(COALESCE(ar.Created_Date, 0) / 1000, 'unixepoch')) as ReadDate,
    h.Host_ID,
    h.Name as HostName,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as TotalUpdates,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as TotalCreates,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as TotalDeletes,
    COUNT(CASE 
        WHEN ar.Created_Date >= strftime('%s', 'now', '-30 days') 
        THEN 1 
    END) as Last30DaysActions,
    COUNT(
        CASE
            WHEN ar.Created_Date >= strftime('%s', 'now', '-24 hour')
            THEN 1
        END
    ) AS Last24HoursActions
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY h.Host_ID, h.Name;

-- View for Remote read/update analytics
DROP VIEW IF EXISTS v_RemoteReadAnalytics;
CREATE VIEW v_RemoteReadAnalytics AS
SELECT 
    strftime('%Y-%m-%d', datetime(COALESCE(ar.Created_Date, 0) / 1000, 'unixepoch')) as ReadDate,
    r.Remote_ID,
    r.Name as RemoteName,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as TotalUpdates,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as TotalCreates,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as TotalDeletes,
    COUNT(CASE 
        WHEN ar.Created_Date >= strftime('%s', 'now', '-30 days') 
        THEN 1 
    END) as Last30DaysActions,
    COUNT(
        CASE
            WHEN ar.Created_Date >= strftime('%s', 'now', '-24 hour')
            THEN 1
        END
    ) AS Last24HoursActions
FROM Remote r
LEFT JOIN AuditReads_Remote ar ON r.Remote_ID = ar.Remote_ID
GROUP BY r.Remote_ID, r.Name;

-- View for Host read/update analytics
DROP VIEW IF EXISTS v_HostReadAnalytics;
CREATE VIEW v_HostReadAnalytics AS
SELECT 
    strftime('%Y-%m-%d', datetime(COALESCE(ar.Created_Date, 0) / 1000, 'unixepoch')) as ReadDate,
    h.Host_ID,
    h.Name as HostName,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as TotalUpdates,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as TotalCreates,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as TotalDeletes,
    COUNT(CASE 
        WHEN ar.Created_Date >= strftime('%s', 'now', '-30 days') 
        THEN 1 
    END) as Last30DaysActions,
    COUNT(
        CASE
            WHEN ar.Created_Date >= strftime('%s', 'now', '-24 hour')
            THEN 1
        END
    ) AS Last24HoursActions
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY h.Host_ID, h.Name;

-- View for daily Host reads
DROP VIEW IF EXISTS v_DailyHostReads;
CREATE VIEW v_DailyHostReads AS
SELECT 
    strftime('%Y-%m-%d', datetime(COALESCE(ar.Created_Date, 0) / 1000, 'unixepoch')) as ReadDate,
    h.Host_ID,
    h.Name as HostName,
    COUNT(ar.AuditRead_ID) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as ReadCount,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as UpdateCount,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as CreateCount,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as DeleteCount
FROM Host h
LEFT JOIN AuditReads_Host ar ON h.Host_ID = ar.Host_ID
GROUP BY DATE(ar.Created_Date), h.Host_ID, h.Name
ORDER BY ReadDate DESC;

-- View for daily Remote reads
DROP VIEW IF EXISTS v_DailyRemoteReads;
CREATE VIEW v_DailyRemoteReads AS
SELECT 
    strftime('%Y-%m-%d', datetime(COALESCE(ar.Created_Date, 0) / 1000, 'unixepoch')) as ReadDate,
    r.Remote_ID,
    r.Name as RemoteName,
    COUNT(ar.AuditRead_ID) as TotalReads,
    COUNT(CASE WHEN ar.Action = 'Read' THEN 1 END) as ReadCount,
    COUNT(CASE WHEN ar.Action = 'Update' THEN 1 END) as UpdateCount,
    COUNT(CASE WHEN ar.Action = 'Create' THEN 1 END) as CreateCount,
    COUNT(CASE WHEN ar.Action = 'Delete' THEN 1 END) as DeleteCount
FROM Remote r
LEFT JOIN AuditReads_Remote ar ON r.Remote_ID = ar.Remote_ID
GROUP BY DATE(ar.Created_Date), r.Remote_ID, r.Name
ORDER BY ReadDate DESC;

-- Search Views
DROP VIEW IF EXISTS v_SearchResults;
CREATE VIEW v_SearchResults AS
WITH HostResults AS (
    -- Direct host matches
    SELECT DISTINCT
        h.Host_ID as EntityId,
        h.Name as EntityName,
        'Host' as EntityType,
        h.Description as Description,
		NULL as Scope,
        h.Environment as Environment,
        h.Key as EntityKey
    FROM Host h
    
    UNION
    
    -- Host matches through tags
    SELECT DISTINCT
        h.Host_ID as EntityId,
        h.Name as EntityName,
        'Host' as EntityType,
        h.Description as Description,
		NULL as Scope,
        h.Environment as Environment,
        h.Key as EntityKey
    FROM Host h
    JOIN Tags_Host th ON h.Host_ID = th.Host_ID
    JOIN Tag t ON th.Tag_ID = t.Tag_ID
),
RemoteResults AS (
    -- Direct remote matches
    SELECT DISTINCT
        r.Remote_ID as EntityId,
        r.Name as EntityName,
        'Remote' as EntityType,
        NULL as Description,
        r.Scope as Scope,
        NULL as Environment,
        r.Key as EntityKey
    FROM Remote r
    
    UNION
    
    -- Remote matches through tags
    SELECT DISTINCT
        r.Remote_ID as EntityId,
        r.Name as EntityName,
        'Remote' as EntityType,
        NULL as Description,
        r.Scope as Scope,
        NULL as Environment,
        r.Key as EntityKey
    FROM Remote r
    JOIN Tags_Remote tr ON r.Remote_ID = tr.Remote_ID
    JOIN Tag t ON tr.Tag_ID = t.Tag_ID
)
SELECT * FROM HostResults
UNION ALL
SELECT * FROM RemoteResults;