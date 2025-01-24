namespace DreamMF.RemoteOrchestration.Core.Interfaces;

public interface IStorageProvider
{
    Task<string> UploadZipAsync(string name, string version, Stream zipContent);
}