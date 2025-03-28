import { z } from 'zod';

export const RouteAssignmentReq = z.object({
  shipmentId: z.number().positive(),
  routeId: z.number().positive(),
  driverId: z.number().positive(),
  assignedAt: z.date().optional()
});
export type RouteAssignmentReq = z.infer<typeof RouteAssignmentReq>;

export const RouteAssignmentRes = z.object({
  id: z.number(),
  shipmentId: z.number(),
  routeId: z.number(),
  driverId: z.number(),
  status: z.string(),
  assignedAt: z.date()
});
export type RouteAssignmentRes = z.infer<typeof RouteAssignmentRes>;