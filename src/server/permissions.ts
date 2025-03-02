import Permission, {PermissionSet} from "../shared/types/permission";

export function hasPermission(set:PermissionSet, permission:Permission):boolean {
    return (set & permission) > 0;
}