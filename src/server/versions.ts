export interface Version {
    major:number,
    minor:number,
    patch:number
}

export function parseVersion(version:string):Version {
    let parts = version.split(".");
    if(parts.length != 3) throw new Error("Incorrect number of version parts");
    return {
        major: parseInt(parts[0]),
        minor: parseInt(parts[1]),
        patch: parseInt(parts[2])
    }
}

export function compareVersions(sbig:string, ssmall:string):boolean {
    let big = parseVersion(sbig);
    let small = parseVersion(ssmall);
    if(big.major !== small.major) return big.major > small.major;
    else
        if(big.minor !== small.minor) return big.minor > small.minor;
        else
            if(big.patch !== small.patch) return big.patch > small.patch;
    return false;
}