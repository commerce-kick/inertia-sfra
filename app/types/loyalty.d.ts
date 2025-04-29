export interface TLoyaltyAccount {
  benefits: Benefit[];
  loyaltyProgramMemberId: string;
  tiers: Tier[];
  tierGroup: string;
  escrowPoints: number;
  Flow__InterviewGuid: string;
  tierBenefits: Tier[];
  voucherDefinitions: null;
  transactions: null;
  vouchers: null;
  points: number;
  promotions: null;
  nextTier: null;
  benefitDefinitions: null;
  tierName: string;
  programName: string;
  MemberBenefits: null;
  interests: null;
  programMemberPromotions: null;
  Flow__InterviewStatus: string;
}

export interface Benefit {
  attributes: Attributes;
  BenefitActionId: null | string;
  BenefitTypeId: string;
  CreatedById: string;
  CreatedDate: string;
  Description: null | string;
  Id: string;
  IsActive: boolean;
  IsDeleted: boolean;
  LastModifiedById: string;
  LastModifiedDate: string;
  LastReferencedDate: null;
  LastViewedDate: null;
  Name: string;
  PrioritySequence: number;
  SystemModstamp: string;
  UnitId: null;
  Value: null;
}

export interface Attributes {
  type: string;
  url: string;
}

export interface Tier {
  attributes: Attributes;
  Id: string;
  Name: string;
  BenefitId?: string;
  SequenceNumber?: number;
}
