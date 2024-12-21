using System.Reflection;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DreamMF.RemoteOrchestration.Database.Migrations
{
    /// <inheritdoc />
    public partial class Views : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("20241221035157_Views_up.sql");
            using var reader = new StreamReader(stream);
            migrationBuilder.Sql(reader.ReadToEnd());
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("20241221035157_Views_down.sql");
            using var reader = new StreamReader(stream);
            migrationBuilder.Sql(reader.ReadToEnd());
        }
    }
}
