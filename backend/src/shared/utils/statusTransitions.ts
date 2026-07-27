import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../errors/ValidationError.js");

type AssetLifecycleAction =
  | "ASSIGN"
  | "RETURN"
  | "DISPATCH"
  | "RECEIVE"
  | "START_MAINTENANCE"
  | "COMPLETE_MAINTENANCE"
  | "DISPOSE";

const VALID_TRANSITIONS: Record<
  AssetLifecycleAction,
  { from: prismaClientModule.EquipmentStatus[]; to: prismaClientModule.EquipmentStatus }
> = {
  ASSIGN: {
    from: ["AVAILABLE"],
    to: "ASSIGNED",
  },
  RETURN: {
    from: ["ASSIGNED"],
    to: "AVAILABLE",
  },
  DISPATCH: {
    from: ["AVAILABLE"],
    to: "IN_TRANSIT",
  },
  RECEIVE: {
    from: ["IN_TRANSIT"],
    to: "AVAILABLE",
  },
  START_MAINTENANCE: {
    from: ["AVAILABLE"],
    to: "MAINTENANCE",
  },
  COMPLETE_MAINTENANCE: {
    from: ["MAINTENANCE"],
    to: "AVAILABLE",
  },
  DISPOSE: {
    from: ["AVAILABLE"],
    to: "RETIRED",
  },
};

function validateStatusTransition(
  currentStatus: prismaClientModule.EquipmentStatus,
  action: AssetLifecycleAction
): prismaClientModule.EquipmentStatus {
  const rule = VALID_TRANSITIONS[action];
  if (!rule.from.includes(currentStatus)) {
    throw new ValidationError(
      `Invalid transition: Cannot perform action '${action}' on asset with status '${currentStatus}'`
    );
  }
  return rule.to;
}

const statusTransitions = {
  validateStatusTransition,
};

export = statusTransitions;
