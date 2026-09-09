export type CouplePartner = {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
};

export type CoupleInvite = {
  code: string;
  status: string;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  usedAt: string | null;
};

export type CoupleRelationship = {
  id: number;
  status: string;
  anniversaryDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  unboundAt: string | null;
};

export type CoupleSpace = {
  isBound: boolean;
  partner: CouplePartner | null;
  relationship: CoupleRelationship | null;
  daysInLove: number | null;
  activeInvite: CoupleInvite | null;
};
