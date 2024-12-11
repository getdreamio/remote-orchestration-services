-- SQL script to create tables based on the entities

CREATE TABLE Version (
    Version_ID INT PRIMARY KEY,
    Remote_ID INT,
    Value VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Audit_Remote (
    Audit_ID INT PRIMARY KEY,
    Remote_ID INT,
    Change VARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Tag (
    Tag_ID INT PRIMARY KEY,
    Text VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Module (
    Module_ID INT PRIMARY KEY,
    List VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Audit_Host (
    Audit_ID INT PRIMARY KEY,
    Host_ID INT,
    Change VARCHAR(255) NOT NULL,
    Change_User_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE [User] (
    User_ID INT PRIMARY KEY,
    Auth_Provider VARCHAR(255) NOT NULL,
    Auth_User_ID VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Configuration (
    Id INT PRIMARY KEY,
    [Key] VARCHAR(255) NOT NULL,
    Value VARCHAR(255) NOT NULL
);

CREATE TABLE Host_Remote (
    Host_Remote_ID INT PRIMARY KEY,
    Host_ID INT,
    Remote_ID INT,
    Version_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Tags_Host (
    Tag_Host_ID INT PRIMARY KEY,
    Host_ID INT,
    Tag_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Remote (
    Remote_ID INT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    StorageType VARCHAR(255) NOT NULL,
    Configuration VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Tags_Remote (
    Tag_Remote_ID INT PRIMARY KEY,
    Remote_ID INT,
    Tag_ID INT,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);

CREATE TABLE Host (
    Host_ID INT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Url VARCHAR(255) NOT NULL,
    [Key] VARCHAR(255) NOT NULL,
    Environment VARCHAR(255) NOT NULL,
    Created_Date DATETIMEOFFSET NOT NULL,
    Updated_Date DATETIMEOFFSET NOT NULL
);
