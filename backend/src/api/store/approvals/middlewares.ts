import {
  authenticate,
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { ensureRole } from "../../middlewares/ensure-role";
import { ApprovalType } from "../../../types/approval";
import { approvalTransformQueryConfig } from "./query-config";
import { StoreGetApprovals, StoreUpdateApproval } from "./validators";

const ensureApprovalType = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const { id } = req.params;

  const query = req.scope.resolve("query");

  const {
    data: [approval],
  } = await query.graph({
    entity: "approval",
    fields: ["type"],
    filters: { id },
  });

  if (!approval) {
    res.status(404).json({ message: "Approval not found" });
    return;
  }

  const approvalType = approval.type as unknown as ApprovalType;

  if (approvalType !== ApprovalType.ADMIN) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  next();
};

export const ensureEmployeeIsAdmin = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const { app_metadata } = req.auth_context;
  const customer_id = app_metadata?.customer_id;
  if (!customer_id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const query = req.scope.resolve("query");
  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["employee.is_admin"],
    filters: { id: customer_id },
  });
  if (!customer?.employee?.is_admin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export const storeApprovalsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/store/approvals*",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      ensureEmployeeIsAdmin,
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/approvals",
    middlewares: [
      validateAndTransformQuery(
        StoreGetApprovals,
        approvalTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/approvals/:id",
    middlewares: [
      ensureApprovalType,
      validateAndTransformBody(StoreUpdateApproval),
    ],
  },
];
