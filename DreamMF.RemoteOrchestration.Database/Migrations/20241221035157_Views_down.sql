-- View for Remote read/update analytics
DROP VIEW v_RemoteReadAnalytics;

-- View for Host read/update analytics
DROP VIEW v_HostReadAnalytics;

-- View for daily Host reads
DROP VIEW v_DailyHostReads;

-- View for daily Remote reads
DROP VIEW v_DailyRemoteReads;

DELETE FROM "__EFMigrationsHistory" WHERE MigrationId = '20241221035157_Views';

COMMIT;
