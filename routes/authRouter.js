import { Router } from 'express';


const authRouter = Router();

authRouter.post('/login', (req, res) => console.log("Login Route"));
authRouter.post('/logout', (req, res) => console.log("Logout Route"));

export default authRouter;
