using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DreamMF.RemoteOrchestration.Database.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Audit_Host",
                columns: table => new
                {
                    Audit_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Host_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Change = table.Column<string>(type: "TEXT", nullable: false),
                    Change_User_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Audit_Host", x => x.Audit_ID);
                });

            migrationBuilder.CreateTable(
                name: "Audit_Remote",
                columns: table => new
                {
                    Audit_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Remote_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Change = table.Column<string>(type: "TEXT", nullable: false),
                    Change_User_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Audit_Remote", x => x.Audit_ID);
                });

            migrationBuilder.CreateTable(
                name: "AuditReads_Host",
                columns: table => new
                {
                    AuditRead_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Host_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<string>(type: "TEXT", nullable: false),
                    User_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditReads_Host", x => x.AuditRead_ID);
                });

            migrationBuilder.CreateTable(
                name: "AuditReads_Remote",
                columns: table => new
                {
                    AuditRead_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Remote_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<string>(type: "TEXT", nullable: false),
                    User_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditReads_Remote", x => x.AuditRead_ID);
                });

            migrationBuilder.CreateTable(
                name: "Configuration",
                columns: table => new
                {
                    Configuration_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Key = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Configuration", x => x.Configuration_ID);
                });

            migrationBuilder.CreateTable(
                name: "Host",
                columns: table => new
                {
                    Host_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Url = table.Column<string>(type: "TEXT", nullable: false),
                    Key = table.Column<string>(type: "TEXT", nullable: false),
                    Environment = table.Column<string>(type: "TEXT", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Host", x => x.Host_ID);
                });

            migrationBuilder.CreateTable(
                name: "Module",
                columns: table => new
                {
                    Module_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Module", x => x.Module_ID);
                });

            migrationBuilder.CreateTable(
                name: "Remote",
                columns: table => new
                {
                    Remote_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Key = table.Column<string>(type: "TEXT", nullable: false),
                    Scope = table.Column<string>(type: "TEXT", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Remote", x => x.Remote_ID);
                });

            migrationBuilder.CreateTable(
                name: "Tag",
                columns: table => new
                {
                    Tag_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Key = table.Column<string>(type: "TEXT", nullable: false),
                    Display_Name = table.Column<string>(type: "TEXT", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tag", x => x.Tag_ID);
                });

            migrationBuilder.CreateTable(
                name: "Host_Remote",
                columns: table => new
                {
                    Host_Remote_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Host_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Remote_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Host_Remote", x => x.Host_Remote_ID);
                    table.ForeignKey(
                        name: "FK_Host_Remote_Remote_Remote_ID",
                        column: x => x.Remote_ID,
                        principalTable: "Remote",
                        principalColumn: "Remote_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Remote_Module",
                columns: table => new
                {
                    Remote_Module_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Remote_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Module_ID = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Remote_Module", x => x.Remote_Module_ID);
                    table.ForeignKey(
                        name: "FK_Remote_Module_Module_Module_ID",
                        column: x => x.Module_ID,
                        principalTable: "Module",
                        principalColumn: "Module_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Remote_Module_Remote_Remote_ID",
                        column: x => x.Remote_ID,
                        principalTable: "Remote",
                        principalColumn: "Remote_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HostTag",
                columns: table => new
                {
                    HostsHost_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    TagsTag_ID = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HostTag", x => new { x.HostsHost_ID, x.TagsTag_ID });
                    table.ForeignKey(
                        name: "FK_HostTag_Host_HostsHost_ID",
                        column: x => x.HostsHost_ID,
                        principalTable: "Host",
                        principalColumn: "Host_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HostTag_Tag_TagsTag_ID",
                        column: x => x.TagsTag_ID,
                        principalTable: "Tag",
                        principalColumn: "Tag_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RemoteTag",
                columns: table => new
                {
                    RemotesRemote_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    TagsTag_ID = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RemoteTag", x => new { x.RemotesRemote_ID, x.TagsTag_ID });
                    table.ForeignKey(
                        name: "FK_RemoteTag_Remote_RemotesRemote_ID",
                        column: x => x.RemotesRemote_ID,
                        principalTable: "Remote",
                        principalColumn: "Remote_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RemoteTag_Tag_TagsTag_ID",
                        column: x => x.TagsTag_ID,
                        principalTable: "Tag",
                        principalColumn: "Tag_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tags_Hosts",
                columns: table => new
                {
                    Tag_Host_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Tag_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Host_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags_Hosts", x => x.Tag_Host_ID);
                    table.ForeignKey(
                        name: "FK_Tags_Hosts_Host_Host_ID",
                        column: x => x.Host_ID,
                        principalTable: "Host",
                        principalColumn: "Host_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tags_Hosts_Tag_Tag_ID",
                        column: x => x.Tag_ID,
                        principalTable: "Tag",
                        principalColumn: "Tag_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tags_Remote",
                columns: table => new
                {
                    Tag_Remote_ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Tag_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Remote_ID = table.Column<int>(type: "INTEGER", nullable: false),
                    Created_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Updated_Date = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags_Remote", x => x.Tag_Remote_ID);
                    table.ForeignKey(
                        name: "FK_Tags_Remote_Remote_Remote_ID",
                        column: x => x.Remote_ID,
                        principalTable: "Remote",
                        principalColumn: "Remote_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tags_Remote_Tag_Tag_ID",
                        column: x => x.Tag_ID,
                        principalTable: "Tag",
                        principalColumn: "Tag_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Host_Remote_Remote_ID",
                table: "Host_Remote",
                column: "Remote_ID");

            migrationBuilder.CreateIndex(
                name: "IX_HostTag_TagsTag_ID",
                table: "HostTag",
                column: "TagsTag_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Remote_Module_Module_ID",
                table: "Remote_Module",
                column: "Module_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Remote_Module_Remote_ID",
                table: "Remote_Module",
                column: "Remote_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RemoteTag_TagsTag_ID",
                table: "RemoteTag",
                column: "TagsTag_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Hosts_Host_ID",
                table: "Tags_Hosts",
                column: "Host_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Hosts_Tag_ID",
                table: "Tags_Hosts",
                column: "Tag_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Remote_Remote_ID",
                table: "Tags_Remote",
                column: "Remote_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Remote_Tag_ID",
                table: "Tags_Remote",
                column: "Tag_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Audit_Host");

            migrationBuilder.DropTable(
                name: "Audit_Remote");

            migrationBuilder.DropTable(
                name: "AuditReads_Host");

            migrationBuilder.DropTable(
                name: "AuditReads_Remote");

            migrationBuilder.DropTable(
                name: "Configuration");

            migrationBuilder.DropTable(
                name: "Host_Remote");

            migrationBuilder.DropTable(
                name: "HostTag");

            migrationBuilder.DropTable(
                name: "Remote_Module");

            migrationBuilder.DropTable(
                name: "RemoteTag");

            migrationBuilder.DropTable(
                name: "Tags_Hosts");

            migrationBuilder.DropTable(
                name: "Tags_Remote");

            migrationBuilder.DropTable(
                name: "Module");

            migrationBuilder.DropTable(
                name: "Host");

            migrationBuilder.DropTable(
                name: "Remote");

            migrationBuilder.DropTable(
                name: "Tag");
        }
    }
}
