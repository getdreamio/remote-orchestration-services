#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "New migration name required"

dotnet ef migrations add "$1" --startup-project DreamMF.RemoteOrchestration.Api --project DreamMF.RemoteOrchestration.Database