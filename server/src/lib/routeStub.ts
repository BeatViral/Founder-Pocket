import type { Router } from "express";

export function stub(router: Router, method: "get" | "post" | "patch" | "delete", path: string, label: string) {
  router[method](path, (req, res) => {
    res.status(method === "post" ? 202 : 200).json({
      ok: true,
      route: `${method.toUpperCase()} ${req.baseUrl}${path}`,
      label,
      mode: "scaffold",
      message: "Backend route is defined. Wire Prisma/service logic here for production mode."
    });
  });
}
