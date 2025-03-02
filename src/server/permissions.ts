import Permission from "../shared/types/permission";

export type PermissionSet = number | Permission;

export function hasPermission(set:PermissionSet, permission:Permission):boolean {
    return (set & permission) > 0;
}