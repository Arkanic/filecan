enum Permission {
    None = 0,
    Upload = 1,
    Admin = 2,
    All = Upload | Admin
}
export default Permission;

export type PermissionSet = number | Permission;