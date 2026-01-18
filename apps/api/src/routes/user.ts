import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

function auth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Get user profile
router.get("/:id", auth, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const jwtUser = (req as any).user as { userId: string };
    if (jwtUser?.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// Update user profile
router.patch("/:id", auth, async (req: Request, res: Response) => {
  const jwtUser = (req as any).user as { userId: string };
  if (jwtUser?.userId !== req.params.id) return res.status(403).json({ error: "Forbidden" });
  const { username, phone, profileImg } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { username, phone, profileImg },
  });
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Adoption History (list of pets adopted by user)
router.get("/:id/adoptions", auth, async (req: Request, res: Response) => {
  const jwtUser = (req as any).user as { userId: string };
  if (jwtUser?.userId !== req.params.id) return res.status(403).json({ error: "Forbidden" });
  const adoptions = await prisma.adoption.findMany({ where: { userId: req.params.id } });
  res.json(adoptions);
});

// Favorites (list of favorited pets)
router.get("/:id/favorites", auth, async (req: Request, res: Response) => {
  const jwtUser = (req as any).user as { userId: string };
  if (jwtUser?.userId !== req.params.id) return res.status(403).json({ error: "Forbidden" });
  const favorites = await prisma.favorite.findMany({ where: { userId: req.params.id } });
  res.json(favorites);
});

// Add pet to favorites
router.post("/:id/favorites", auth, async (req: Request, res: Response) => {
  const jwtUser = (req as any).user as { userId: string };
  if (jwtUser?.userId !== req.params.id) return res.status(403).json({ error: "Forbidden" });
  const { petName } = req.body;
  const favorite = await prisma.favorite.create({
    data: { userId: req.params.id, petName },
  });
  res.json(favorite);
});

// Remove pet from favorites
router.delete("/:id/favorites/:favoriteId", auth, async (req: Request, res: Response) => {
  const jwtUser = (req as any).user as { userId: string };
  if (jwtUser?.userId !== req.params.id) return res.status(403).json({ error: "Forbidden" });
  await prisma.favorite.delete({ where: { id: req.params.favoriteId } });
  res.json({ message: "Pet removed from favorites" });
});

export default router; 