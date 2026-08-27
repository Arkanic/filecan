interface AuthRequest {
    type: "upload" | "admin",
    password:string,
    token?:string
}

export default AuthRequest;